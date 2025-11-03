import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions, tasks, wallets, walletTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id);

    // Validate submission ID
    if (!submissionId || isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'Valid submission ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { employerId, reviewerNotes } = body;

    // Validate required fields
    if (!employerId) {
      return NextResponse.json(
        { error: 'employerId is required', code: 'MISSING_EMPLOYER_ID' },
        { status: 400 }
      );
    }

    // Get submission
    const submission = await db
      .select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'SUBMISSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentSubmission = submission[0];

    // Validate submission status
    if (currentSubmission.status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Only pending submissions can be approved',
          code: 'INVALID_STATUS',
        },
        { status: 409 }
      );
    }

    // Get task details
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, currentSubmission.taskId!))
      .limit(1);

    if (task.length === 0) {
      return NextResponse.json(
        { error: 'Associated task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentTask = task[0];

    // Verify employer matches task employer
    if (currentTask.employerId !== employerId) {
      return NextResponse.json(
        {
          error: 'Employer ID does not match task employer',
          code: 'UNAUTHORIZED_EMPLOYER',
        },
        { status: 403 }
      );
    }

    // Update submission
    const updatedSubmission = await db
      .update(taskSubmissions)
      .set({
        status: 'approved',
        reviewedAt: new Date(),
        reviewerNotes: reviewerNotes || null,
      })
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    // Initialize payment status
    let paymentStatus = 'not_processed';
    let transactionDetails = null;

    // Process payment - Use task's currency field
    try {
      const taskPrice = currentTask.price;
      const currencyType = currentTask.currency || 'USD'; // Use task currency

      // Find employer wallet or create if doesn't exist
      let employerWallet = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, employerId),
            eq(wallets.currencyType, currencyType)
          )
        )
        .limit(1);
        
      // Create employer wallet if it doesn't exist
      if (employerWallet.length === 0) {
        console.log(`Creating ${currencyType} wallet for employer ${employerId}`);
        const newEmployerWallet = await db
          .insert(wallets)
          .values({
            userId: employerId,
            currencyType: currencyType,
            balance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning();
        employerWallet = newEmployerWallet;
      }

      // Find worker wallet or create if doesn't exist
      let workerWallet = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, currentSubmission.workerId!),
            eq(wallets.currencyType, currencyType)
          )
        )
        .limit(1);

      // Check if employer has sufficient balance
      console.log(`Employer wallet balance: ${employerWallet[0].balance}, Task price: ${taskPrice}`);
      if (employerWallet[0].balance < taskPrice) {
        paymentStatus = 'failed';
        transactionDetails = { 
          error: `Insufficient ${currencyType} balance. Please add funds to your wallet.`,
          required: taskPrice,
          available: employerWallet[0].balance,
          currency: currencyType
        };
      } else {
        const timestamp = new Date().toISOString();

        // Create worker wallet if it doesn't exist
        if (workerWallet.length === 0) {
          const newWorkerWallet = await db
            .insert(wallets)
            .values({
              userId: currentSubmission.workerId!,
              currencyType: currencyType,
              balance: 0,
              createdAt: timestamp,
              updatedAt: timestamp,
            })
            .returning();
          workerWallet = newWorkerWallet;
        }

        const referenceId = `task_${currentTask.id}_submission_${submissionId}`;

        // Deduct FULL amount from employer wallet
        const updatedEmployerWallet = await db
          .update(wallets)
          .set({
            balance: employerWallet[0].balance - taskPrice,
            updatedAt: timestamp,
          })
          .where(eq(wallets.id, employerWallet[0].id))
          .returning();

        // Add FULL amount to worker wallet
        const updatedWorkerWallet = await db
          .update(wallets)
          .set({
            balance: workerWallet[0].balance + taskPrice,
            updatedAt: timestamp,
          })
          .where(eq(wallets.id, workerWallet[0].id))
          .returning();

        // Create employer transaction (debit full amount)
        const employerTransaction = await db
          .insert(walletTransactions)
          .values({
            walletId: employerWallet[0].id,
            transactionType: 'task_payment',
            amount: -taskPrice,
            currencyType: currencyType,
            status: 'completed',
            referenceId: referenceId,
            description: `Payment for task: ${currentTask.title} (${currencyType})`,
            createdAt: timestamp,
          })
          .returning();

        // Create worker transaction (credit full amount)
        const workerTransaction = await db
          .insert(walletTransactions)
          .values({
            walletId: workerWallet[0].id,
            transactionType: 'task_payment',
            amount: taskPrice,
            currencyType: currencyType,
            status: 'completed',
            referenceId: referenceId,
            description: `Payment received for task: ${currentTask.title} (${currencyType})`,
            createdAt: timestamp,
          })
          .returning();

        paymentStatus = 'success';
        transactionDetails = {
          employerTransaction: employerTransaction[0],
          workerTransaction: workerTransaction[0],
          employerBalance: updatedEmployerWallet[0].balance,
          workerBalance: updatedWorkerWallet[0].balance,
          currency: currencyType,
          amount: taskPrice,
        };
      }
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      paymentStatus = 'failed';
      transactionDetails = {
        error:
          'Payment processing failed: ' +
          (paymentError instanceof Error ? paymentError.message : 'Unknown error'),
      };
    }

    // Increment task slots filled
    const newSlotsFilled = currentTask.slotsFilled + 1;
    let taskStatus = currentTask.status;

    // Check if task should be completed
    if (newSlotsFilled >= currentTask.slots) {
      taskStatus = 'completed';
    }

    // Update task
    const updatedTask = await db
      .update(tasks)
      .set({
        slotsFilled: newSlotsFilled,
        status: taskStatus,
      })
      .where(eq(tasks.id, currentTask.id))
      .returning();

    // Return response with payment status
    const response = {
      submission: updatedSubmission[0],
      task: updatedTask[0],
      paymentStatus,
      transactionDetails,
    };
    
    // Log payment outcome for debugging
    console.log('Approval completed with payment status:', paymentStatus);
    if (paymentStatus === 'failed') {
      console.error('Payment failed:', transactionDetails);
    }
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}