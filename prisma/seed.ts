import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nexora Learn production-grade demo data...");

  // 1. Clean existing records in correct relation order
  await prisma.auditEvent.deleteMany({});
  await prisma.outboxEvent.deleteMany({});
  await prisma.jobRecord.deleteMany({});
  await prisma.idempotencyRecord.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.gradeRevision.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.attemptQuestionSnapshot.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.quizAccommodation.deleteMany({});
  await prisma.quizVersionQuestion.deleteMany({});
  await prisma.quizVersion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.questionVersion.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.courseTeacher.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Nexora Demo University",
      slug: "nexora-demo",
    },
  });

  // 3. Create Users
  const passwordHash = await bcrypt.hash("NexoraPass2026!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Dr. Elena Vance",
      email: "admin@nexora.demo",
      passwordHash,
      timezone: "America/New_York",
      memberships: {
        create: { organizationId: org.id, role: "ADMIN" },
      },
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: "Prof. Alexander Ross",
      email: "teacher@nexora.demo",
      passwordHash,
      timezone: "America/New_York",
      memberships: {
        create: { organizationId: org.id, role: "TEACHER" },
      },
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Dr. Sarah Lin",
      email: "teacher2@nexora.demo",
      passwordHash,
      timezone: "America/Chicago",
      memberships: {
        create: { organizationId: org.id, role: "TEACHER" },
      },
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Anjan Sharma",
      email: "student@nexora.demo",
      passwordHash,
      timezone: "Asia/Kolkata",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Marcus Chen",
      email: "student2@nexora.demo",
      passwordHash,
      timezone: "America/Los_Angeles",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Aria Montgomery",
      email: "student3@nexora.demo",
      passwordHash,
      timezone: "Europe/London",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Devon Miller",
      email: "student4@nexora.demo",
      passwordHash,
      timezone: "America/New_York",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "student5@nexora.demo",
      passwordHash,
      timezone: "Asia/Kolkata",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const student6 = await prisma.user.create({
    data: {
      name: "Lucas Wright",
      email: "student6@nexora.demo",
      passwordHash,
      timezone: "Europe/Berlin",
      memberships: {
        create: { organizationId: org.id, role: "STUDENT" },
      },
    },
  });

  const allStudents = [student1, student2, student3, student4, student5, student6];

  // 4. Create Courses
  const courseML = await prisma.course.create({
    data: {
      organizationId: org.id,
      title: "Machine Learning Foundations",
      code: "CS-501",
      slug: "ml-foundations",
      description:
        "Comprehensive mathematical and algorithmic foundation of modern machine learning: probability theory, regression, classification, neural networks, and model diagnostics.",
      state: "PUBLISHED",
      enrollmentCode: "NX-ML-2046",
      enrollmentLimit: 100,
      courseTeachers: {
        create: [
          { teacherId: teacher1.id, role: "PRIMARY" },
          { teacherId: teacher2.id, role: "ASSISTANT" },
        ],
      },
    },
  });

  const courseWeb = await prisma.course.create({
    data: {
      organizationId: org.id,
      title: "Full Stack Web Engineering",
      code: "CS-302",
      slug: "fullstack-web",
      description:
        "Modern scalable full stack applications with Next.js, TypeScript, PostgreSQL, state architecture, accessibility standards, and cloud deployment pipelines.",
      state: "PUBLISHED",
      enrollmentCode: "NX-FS-3020",
      enrollmentLimit: 80,
      courseTeachers: {
        create: [{ teacherId: teacher2.id, role: "PRIMARY" }],
      },
    },
  });

  const courseDB = await prisma.course.create({
    data: {
      organizationId: org.id,
      title: "Database Systems & Architecture",
      code: "CS-404",
      slug: "database-systems",
      description:
        "Relational algebra, ACID transactions, WAL logging, distributed consensus, indexing strategies, and database query optimization.",
      state: "PUBLISHED",
      enrollmentCode: "NX-DB-4040",
      enrollmentLimit: 75,
      courseTeachers: {
        create: [{ teacherId: teacher1.id, role: "PRIMARY" }],
      },
    },
  });

  const courseSec = await prisma.course.create({
    data: {
      organizationId: org.id,
      title: "Cybersecurity Fundamentals",
      code: "SEC-201",
      slug: "cybersecurity",
      description: "Network security protocols, cryptographic primitives, threat modeling, and defensive secure coding patterns.",
      state: "DRAFT",
      enrollmentCode: "NX-SEC-201",
      enrollmentLimit: 50,
      courseTeachers: {
        create: [{ teacherId: teacher2.id, role: "PRIMARY" }],
      },
    },
  });

  // 5. Enrollments
  for (const s of allStudents) {
    await prisma.enrollment.create({
      data: {
        courseId: courseML.id,
        studentId: s.id,
        status: "ACTIVE",
      },
    });
  }

  // Enroll some in Web & DB
  await prisma.enrollment.create({
    data: { courseId: courseWeb.id, studentId: student1.id, status: "ACTIVE" },
  });
  await prisma.enrollment.create({
    data: { courseId: courseWeb.id, studentId: student2.id, status: "ACTIVE" },
  });
  await prisma.enrollment.create({
    data: { courseId: courseDB.id, studentId: student1.id, status: "ACTIVE" },
  });

  // 6. Modules & Lessons for ML Course
  const module1 = await prisma.module.create({
    data: {
      courseId: courseML.id,
      title: "Statistical Foundations & Probability",
      description: "Core axioms of probability, conditional likelihood, and statistical estimators.",
      orderIndex: 1,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Supervised vs Unsupervised Learning Paradigms",
      description: "Comparing inductive biases, objective functions, and target label structures.",
      orderIndex: 1,
      isRequired: true,
      durationMinutes: 20,
      content: `## Supervised vs. Unsupervised Learning

In machine learning, algorithms extract patterns from empirical data by optimizing parameterized mathematical functions.

### 1. Supervised Learning
Given training data consisting of pairs $(x_i, y_i)$, where $x_i \\in \\mathcal{X}$ is the feature vector and $y_i \\in \\mathcal{Y}$ is the supervisor target label.

- **Classification**: When $\\mathcal{Y}$ is discrete (e.g., categorical outcomes).
- **Regression**: When $\\mathcal{Y}$ is continuous (e.g., real-valued predictions).

### 2. Unsupervised Learning
Given unlabeled observations $x_i \\in \\mathcal{X}$, the model seeks inherent structural distributions, geometric clustering, or lower-dimensional manifold projections without explicit ground-truth targets.

### Key Takeaways
- Supervised learning maps inputs to target outputs via loss minimization.
- Unsupervised learning discovers underlying structural manifolds and densities.
- Objective functions dictate model generalization behavior.`,
      takeaways: "1. Supervised learning utilizes labelled pairs (x, y).\n2. Loss functions quantify prediction deviation.\n3. Generalization error is tested on unseen distributions.",
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Probability Distributions & Bayes Theorem",
      description: "Axioms of probability, Bayes theorem derivation, and Bayesian decision theory.",
      orderIndex: 2,
      isRequired: true,
      durationMinutes: 25,
      content: `## Bayes Theorem & Conditional Probability

Bayes' Theorem provides the mathematical bridge between observable evidence and unobservable parameter hypotheses.

### Formula
$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$

Where:
- $P(A)$: **Prior Probability** (our initial belief before observing data)
- $P(B|A)$: **Likelihood** (the probability of observing evidence $B$ given hypothesis $A$)
- $P(B)$: **Marginal Evidence** (the total probability of observing evidence $B$)
- $P(A|B)$: **Posterior Probability** (the revised belief after accounting for evidence)

### Law of Total Probability
$$P(B) = \\sum_{i} P(B|A_i) P(A_i)$$

This formulation is foundational for Naive Bayes classifiers, Bayesian optimization, and probabilistic neural networks.`,
      takeaways: "1. Prior * Likelihood / Evidence = Posterior.\n2. Normalizing constant ensures posterior integrates to 1.\n3. Essential for uncertainty quantification.",
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Linear & Logistic Regression Fundamentals",
      description: "Ordinary least squares, log-odds transformation, and maximum likelihood estimation.",
      orderIndex: 3,
      isRequired: true,
      durationMinutes: 30,
      content: `## Linear & Logistic Regression

Regression models form the backbone of parametric machine learning.

### Linear Regression
Linear regression assumes a linear relationship between input vector $\\mathbf{x}$ and scalar continuous target $y$:
$$\\hat{y} = \\mathbf{w}^T \\mathbf{x} + b$$
The parameters are found by minimizing Mean Squared Error (MSE).

### Logistic Regression
For binary classification, linear outputs are mapped into a probability interval $[0, 1]$ using the sigmoid function:
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
We optimize using Binary Cross-Entropy Loss (Log Loss) derived via Maximum Likelihood Estimation (MLE).`,
      takeaways: "1. Linear regression models continuous targets.\n2. Logistic regression applies the sigmoid activation to compute probabilities.\n3. Log-loss penalizes confident incorrect predictions exponentially.",
    },
  });

  const module2 = await prisma.module.create({
    data: {
      courseId: courseML.id,
      title: "Model Diagnostics & Evaluation Metrics",
      description: "Confusion matrices, ROC-AUC, cross-validation, and bias-variance decomposition.",
      orderIndex: 2,
    },
  });

  const lesson4 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Confusion Matrix, Precision, and Recall",
      description: "Evaluating classification models beyond simple accuracy under class imbalance.",
      orderIndex: 1,
      isRequired: true,
      durationMinutes: 25,
      content: `## Classification Metrics: Precision & Recall

Accuracy is misleading when classes are imbalanced. We analyze models using the **Confusion Matrix**:

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

### Key Metrics
- **Precision**: $\\frac{TP}{TP + FP}$ — How many predicted positives were truly positive?
- **Recall (Sensitivity)**: $\\frac{TP}{TP + FN}$ — How many actual positives did we capture?
- **F1-Score**: Harmonic mean of Precision and Recall:
$$F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$`,
      takeaways: "1. Precision penalizes False Positives.\n2. Recall penalizes False Negatives (missed cases).\n3. F1 score balances precision and recall harmonic scale.",
    },
  });

  const lesson5 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Regularization & Overfitting Prevention",
      description: "L1 Lasso, L2 Ridge, Dropout, and K-Fold cross validation.",
      orderIndex: 2,
      isRequired: true,
      durationMinutes: 20,
      content: `## Overfitting & Regularization

Overfitting occurs when a model captures random noise in the training set rather than the underlying distribution.

### L1 Regularization (Lasso)
Adds an $L_1$ penalty to the loss function: $\\lambda \\sum |w_i|$. Induces sparsity, driving uninformative weights to exactly zero.

### L2 Regularization (Ridge)
Adds an $L_2$ penalty: $\\frac{\\lambda}{2} \\sum w_i^2$. Penalizes large magnitude weights, keeping weight distributions smooth and preventing extreme sensitivity.`,
      takeaways: "1. L1 induces weight sparsity.\n2. L2 prevents large weights without setting them to zero.\n3. Cross-validation estimates out-of-sample generalization.",
    },
  });

  // 7. Seed Question Bank with all 5 types
  const q1 = await prisma.question.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      authorId: teacher1.id,
      type: "SINGLE_CHOICE",
      prompt: "In a binary classification confusion matrix, what do the values along the principal diagonal represent?",
      options: JSON.stringify([
        { id: "opt_a", text: "True Positives and True Negatives (Correct Classifications)" },
        { id: "opt_b", text: "False Positives and False Negatives (Type I and Type II Errors)" },
        { id: "opt_c", text: "Only True Positives" },
        { id: "opt_d", text: "Total number of observations in the dataset" },
      ]),
      correctAnswers: JSON.stringify(["opt_a"]),
      explanation: "The principal diagonal of a confusion matrix represents accurate classifications: True Positives (top-left) and True Negatives (bottom-right).",
      points: 2.0,
      difficulty: "EASY",
      tags: JSON.stringify(["Confusion Matrix", "Model Evaluation"]),
      usageCount: 1,
      versions: {
        create: {
          versionNumber: 1,
          type: "SINGLE_CHOICE",
          prompt: "In a binary classification confusion matrix, what do the values along the principal diagonal represent?",
          options: JSON.stringify([
            { id: "opt_a", text: "True Positives and True Negatives (Correct Classifications)" },
            { id: "opt_b", text: "False Positives and False Negatives (Type I and Type II Errors)" },
            { id: "opt_c", text: "Only True Positives" },
            { id: "opt_d", text: "Total number of observations in the dataset" },
          ]),
          correctAnswers: JSON.stringify(["opt_a"]),
          explanation: "The principal diagonal of a confusion matrix represents accurate classifications: True Positives (top-left) and True Negatives (bottom-right).",
          points: 2.0,
          difficulty: "EASY",
          tags: JSON.stringify(["Confusion Matrix", "Model Evaluation"]),
        },
      },
    },
    include: { versions: true },
  });

  const q2 = await prisma.question.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      authorId: teacher1.id,
      type: "MULTIPLE_SELECT",
      prompt: "Which of the following techniques directly mitigate model overfitting? (Select all that apply)",
      options: JSON.stringify([
        { id: "opt_reg", text: "Applying L2 (Ridge) Regularization to the loss function" },
        { id: "opt_drop", text: "Utilizing Dropout layers during neural network training" },
        { id: "opt_data", text: "Dataset expansion through Data Augmentation" },
        { id: "opt_depth", text: "Substantially increasing tree depth without pruning" },
      ]),
      correctAnswers: JSON.stringify(["opt_reg", "opt_drop", "opt_data"]),
      explanation: "L2 regularization, Dropout, and Data Augmentation reduce overfitting. Increasing tree depth without pruning increases model variance and leads to severe overfitting.",
      points: 3.0,
      difficulty: "MEDIUM",
      tags: JSON.stringify(["Overfitting", "Regularization", "Neural Networks"]),
      usageCount: 1,
      versions: {
        create: {
          versionNumber: 1,
          type: "MULTIPLE_SELECT",
          prompt: "Which of the following techniques directly mitigate model overfitting? (Select all that apply)",
          options: JSON.stringify([
            { id: "opt_reg", text: "Applying L2 (Ridge) Regularization to the loss function" },
            { id: "opt_drop", text: "Utilizing Dropout layers during neural network training" },
            { id: "opt_data", text: "Dataset expansion through Data Augmentation" },
            { id: "opt_depth", text: "Substantially increasing tree depth without pruning" },
          ]),
          correctAnswers: JSON.stringify(["opt_reg", "opt_drop", "opt_data"]),
          explanation: "L2 regularization, Dropout, and Data Augmentation reduce overfitting. Increasing tree depth without pruning increases model variance and leads to severe overfitting.",
          points: 3.0,
          difficulty: "MEDIUM",
          tags: JSON.stringify(["Overfitting", "Regularization", "Neural Networks"]),
        },
      },
    },
    include: { versions: true },
  });

  const q3 = await prisma.question.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      authorId: teacher1.id,
      type: "TRUE_FALSE",
      prompt: "Bayes' Theorem computes posterior probability by multiplying the prior probability by the likelihood, and dividing by the marginal evidence.",
      options: JSON.stringify([
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ]),
      correctAnswers: JSON.stringify(["true"]),
      explanation: "True. P(Hypothesis | Evidence) = [P(Evidence | Hypothesis) * P(Hypothesis)] / P(Evidence).",
      points: 2.0,
      difficulty: "EASY",
      tags: JSON.stringify(["Bayes Theorem", "Probability"]),
      usageCount: 1,
      versions: {
        create: {
          versionNumber: 1,
          type: "TRUE_FALSE",
          prompt: "Bayes' Theorem computes posterior probability by multiplying the prior probability by the likelihood, and dividing by the marginal evidence.",
          options: JSON.stringify([
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ]),
          correctAnswers: JSON.stringify(["true"]),
          explanation: "True. P(Hypothesis | Evidence) = [P(Evidence | Hypothesis) * P(Hypothesis)] / P(Evidence).",
          points: 2.0,
          difficulty: "EASY",
          tags: JSON.stringify(["Bayes Theorem", "Probability"]),
        },
      },
    },
    include: { versions: true },
  });

  const q4 = await prisma.question.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      authorId: teacher1.id,
      type: "SHORT_ANSWER",
      prompt: "What is the name of the fundamental optimization algorithm that iteratively updates model parameters in the opposite direction of the gradient of the loss function?",
      acceptedAnswers: JSON.stringify(["gradient descent", "gradient descent algorithm", "sgd", "stochastic gradient descent"]),
      explanation: "Gradient Descent is the cornerstone first-order optimization algorithm used to train differentiable models.",
      points: 3.0,
      difficulty: "MEDIUM",
      tags: JSON.stringify(["Optimization", "Gradient Descent"]),
      usageCount: 1,
      versions: {
        create: {
          versionNumber: 1,
          type: "SHORT_ANSWER",
          prompt: "What is the name of the fundamental optimization algorithm that iteratively updates model parameters in the opposite direction of the gradient of the loss function?",
          acceptedAnswers: JSON.stringify(["gradient descent", "gradient descent algorithm", "sgd", "stochastic gradient descent"]),
          explanation: "Gradient Descent is the cornerstone first-order optimization algorithm used to train differentiable models.",
          points: 3.0,
          difficulty: "MEDIUM",
          tags: JSON.stringify(["Optimization", "Gradient Descent"]),
        },
      },
    },
    include: { versions: true },
  });

  const q5 = await prisma.question.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      authorId: teacher1.id,
      type: "ESSAY",
      prompt: "Explain the difference between Type I and Type II errors in machine learning classification. Provide a concrete real-world scenario (such as medical diagnosis or fraud detection) where a Type II error is substantially more hazardous than a Type I error, and explain how an engineer would tune decision thresholds to prioritize minimizing Type II errors.",
      rubric: "1. Clear definition of Type I (False Positive) vs Type II (False Negative) (3 pts)\n2. Realistic, detailed application scenario (3 pts)\n3. Threshold tuning and metric prioritization (Recall / F-beta) (4 pts)",
      points: 10.0,
      difficulty: "HARD",
      tags: JSON.stringify(["Classification", "Precision vs Recall", "Error Analysis"]),
      usageCount: 1,
      versions: {
        create: {
          versionNumber: 1,
          type: "ESSAY",
          prompt: "Explain the difference between Type I and Type II errors in machine learning classification. Provide a concrete real-world scenario (such as medical diagnosis or fraud detection) where a Type II error is substantially more hazardous than a Type I error, and explain how an engineer would tune decision thresholds to prioritize minimizing Type II errors.",
          rubric: "1. Clear definition of Type I (False Positive) vs Type II (False Negative) (3 pts)\n2. Realistic, detailed application scenario (3 pts)\n3. Threshold tuning and metric prioritization (Recall / F-beta) (4 pts)",
          points: 10.0,
          difficulty: "HARD",
          tags: JSON.stringify(["Classification", "Precision vs Recall", "Error Analysis"]),
        },
      },
    },
    include: { versions: true },
  });

  // 8. Create Quiz and Immutable Quiz Version
  const quizClosing = new Date();
  quizClosing.setDate(quizClosing.getDate() + 14);

  const quizML = await prisma.quiz.create({
    data: {
      organizationId: org.id,
      courseId: courseML.id,
      moduleId: module2.id,
      title: "ML Foundations Comprehensive Assessment",
      instructions: "This assessment evaluates statistical principles, probability, model diagnostics, and error analysis. You have 30 minutes. Your answers are automatically saved to the server.",
      state: "PUBLISHED",
      closingDate: quizClosing,
      timeLimitMinutes: 30,
      maxAttempts: 2,
      passingPercentage: 70.0,
      navigationPolicy: "FREE",
      resultReleasePolicy: "IMMEDIATE",
      showCorrectAnswers: "ALWAYS",
      showExplanations: "ALWAYS",
      gradeSelectionRule: "HIGHEST",
      isRequired: true,
      versions: {
        create: {
          versionNumber: 1,
          title: "ML Foundations Comprehensive Assessment (v1)",
          instructions: "This assessment evaluates statistical principles, probability, model diagnostics, and error analysis.",
          timeLimitMinutes: 30,
          maxAttempts: 2,
          passingPercentage: 70.0,
          navigationPolicy: "FREE",
          resultReleasePolicy: "IMMEDIATE",
          showCorrectAnswers: "ALWAYS",
          showExplanations: "ALWAYS",
          gradeSelectionRule: "HIGHEST",
          publishedById: teacher1.id,
          questions: {
            create: [
              { questionVersionId: q1.versions[0].id, orderIndex: 1, pointsOverride: 2.0 },
              { questionVersionId: q2.versions[0].id, orderIndex: 2, pointsOverride: 3.0 },
              { questionVersionId: q3.versions[0].id, orderIndex: 3, pointsOverride: 2.0 },
              { questionVersionId: q4.versions[0].id, orderIndex: 4, pointsOverride: 3.0 },
              { questionVersionId: q5.versions[0].id, orderIndex: 5, pointsOverride: 10.0 },
            ],
          },
        },
      },
    },
    include: {
      versions: {
        include: { questions: true },
      },
    },
  });

  const quizVersion = quizML.versions[0];

  // 9. Realistic Demo Scenarios
  // Student 1 (Anjan Sharma): Completed lessons 1, 2, 3; Attempted quiz, graded, released!
  await prisma.lessonProgress.create({
    data: { studentId: student1.id, lessonId: lesson1.id, isCompleted: true, completedAt: new Date() },
  });
  await prisma.lessonProgress.create({
    data: { studentId: student1.id, lessonId: lesson2.id, isCompleted: true, completedAt: new Date() },
  });
  await prisma.lessonProgress.create({
    data: { studentId: student1.id, lessonId: lesson3.id, isCompleted: true, completedAt: new Date() },
  });

  const attemptStudent1 = await prisma.attempt.create({
    data: {
      quizId: quizML.id,
      quizVersionId: quizVersion.id,
      studentId: student1.id,
      attemptNumber: 1,
      status: "RELEASED",
      startedAt: new Date(Date.now() - 3600000),
      submittedAt: new Date(Date.now() - 2400000),
      deadlineAt: new Date(Date.now() + 1800000),
      totalPointsEarned: 16.0,
      totalPointsPossible: 20.0,
      percentage: 80.0,
      isPassed: true,
      isSelectedForGradebook: true,
    },
  });

  // Snapshots for attempt 1
  for (const qvq of quizVersion.questions) {
    const qv = [q1, q2, q3, q4, q5].find((q) => q.versions[0].id === qvq.questionVersionId)?.versions[0]!;
    await prisma.attemptQuestionSnapshot.create({
      data: {
        attemptId: attemptStudent1.id,
        questionVersionId: qv.id,
        orderIndex: qvq.orderIndex,
        prompt: qv.prompt,
        type: qv.type,
        options: qv.options,
        explanation: qv.explanation,
        rubric: qv.rubric,
        pointsPossible: qv.points,
      },
    });
  }

  // Answers for Student 1
  await prisma.answer.create({
    data: {
      attemptId: attemptStudent1.id,
      questionVersionId: q1.versions[0].id,
      response: "opt_a",
      isCorrect: true,
      pointsEarned: 2.0,
    },
  });
  await prisma.answer.create({
    data: {
      attemptId: attemptStudent1.id,
      questionVersionId: q2.versions[0].id,
      response: JSON.stringify(["opt_reg", "opt_drop"]), // missed opt_data
      isCorrect: false,
      pointsEarned: 0.0,
    },
  });
  await prisma.answer.create({
    data: {
      attemptId: attemptStudent1.id,
      questionVersionId: q3.versions[0].id,
      response: "true",
      isCorrect: true,
      pointsEarned: 2.0,
    },
  });
  await prisma.answer.create({
    data: {
      attemptId: attemptStudent1.id,
      questionVersionId: q4.versions[0].id,
      response: "Gradient Descent",
      isCorrect: true,
      pointsEarned: 3.0,
    },
  });
  const essayAnswerS1 = await prisma.answer.create({
    data: {
      attemptId: attemptStudent1.id,
      questionVersionId: q5.versions[0].id,
      response: "A Type I error is a False Positive (predicting positive when actual is negative), whereas a Type II error is a False Negative (predicting negative when actual is positive). In oncological screening (cancer detection), a Type II error means failing to diagnose an aggressive malignant tumor in a patient who truly has cancer. This delays lifesaving treatment, directly leading to patient mortality. A Type I error merely causes temporary emotional anxiety and a confirmatory secondary biopsy. To mitigate hazardous Type II errors, the machine learning engineer lowers the classification probability threshold from 0.5 to e.g. 0.2, drastically increasing Recall and minimizing missed cases, while prioritizing F2-score over standard F1.",
      isCorrect: true,
      pointsEarned: 9.0,
      feedback: "Exceptional clinical reasoning and mathematically sound threshold adjustment explanation. Excellent job Anjan!",
    },
  });

  // Grade revision record for essay
  await prisma.gradeRevision.create({
    data: {
      attemptId: attemptStudent1.id,
      answerId: essayAnswerS1.id,
      previousScore: null,
      newScore: 9.0,
      newFeedback: "Exceptional clinical reasoning and mathematically sound threshold adjustment explanation. Excellent job Anjan!",
      graderId: teacher1.id,
      reason: "Initial evaluation of essay question",
    },
  });

  // Student 3 (Aria Montgomery): Submitted attempt with Essay AWAITING GRADING
  const attemptStudent3 = await prisma.attempt.create({
    data: {
      quizId: quizML.id,
      quizVersionId: quizVersion.id,
      studentId: student3.id,
      attemptNumber: 1,
      status: "AWAITING_GRADING",
      startedAt: new Date(Date.now() - 1800000),
      submittedAt: new Date(Date.now() - 600000),
      deadlineAt: new Date(Date.now() + 1800000),
      totalPointsEarned: 7.0, // pending essay points
      totalPointsPossible: 20.0,
      percentage: 35.0,
      isPassed: false,
      isSelectedForGradebook: true,
    },
  });

  for (const qvq of quizVersion.questions) {
    const qv = [q1, q2, q3, q4, q5].find((q) => q.versions[0].id === qvq.questionVersionId)?.versions[0]!;
    await prisma.attemptQuestionSnapshot.create({
      data: {
        attemptId: attemptStudent3.id,
        questionVersionId: qv.id,
        orderIndex: qvq.orderIndex,
        prompt: qv.prompt,
        type: qv.type,
        options: qv.options,
        explanation: qv.explanation,
        rubric: qv.rubric,
        pointsPossible: qv.points,
      },
    });
  }

  await prisma.answer.create({
    data: { attemptId: attemptStudent3.id, questionVersionId: q1.versions[0].id, response: "opt_a", isCorrect: true, pointsEarned: 2.0 },
  });
  await prisma.answer.create({
    data: { attemptId: attemptStudent3.id, questionVersionId: q2.versions[0].id, response: JSON.stringify(["opt_reg", "opt_drop", "opt_data"]), isCorrect: true, pointsEarned: 3.0 },
  });
  await prisma.answer.create({
    data: { attemptId: attemptStudent3.id, questionVersionId: q3.versions[0].id, response: "true", isCorrect: true, pointsEarned: 2.0 },
  });
  await prisma.answer.create({
    data: { attemptId: attemptStudent3.id, questionVersionId: q4.versions[0].id, response: "backprop", isCorrect: false, pointsEarned: 0.0 },
  });
  await prisma.answer.create({
    data: {
      attemptId: attemptStudent3.id,
      questionVersionId: q5.versions[0].id,
      response: "Type I error is false positive, Type II is false negative. In fraud detection or medical detection, missing a fraudster or tumor is dangerous. Engineers can adjust decision boundary.",
      pointsEarned: null, // Awaiting teacher grading!
      isCorrect: null,
    },
  });

  // Student 4 & 5 graded attempts for realistic gradebook and metrics
  await prisma.attempt.create({
    data: {
      quizId: quizML.id,
      quizVersionId: quizVersion.id,
      studentId: student4.id,
      attemptNumber: 1,
      status: "RELEASED",
      startedAt: new Date(Date.now() - 7200000),
      submittedAt: new Date(Date.now() - 6000000),
      deadlineAt: new Date(Date.now() + 1800000),
      totalPointsEarned: 18.0,
      totalPointsPossible: 20.0,
      percentage: 90.0,
      isPassed: true,
      isSelectedForGradebook: true,
    },
  });

  await prisma.attempt.create({
    data: {
      quizId: quizML.id,
      quizVersionId: quizVersion.id,
      studentId: student5.id,
      attemptNumber: 1,
      status: "RELEASED",
      startedAt: new Date(Date.now() - 9200000),
      submittedAt: new Date(Date.now() - 8000000),
      deadlineAt: new Date(Date.now() + 1800000),
      totalPointsEarned: 15.0,
      totalPointsPossible: 20.0,
      percentage: 75.0,
      isPassed: true,
      isSelectedForGradebook: true,
    },
  });

  // 10. Notifications
  await prisma.notification.create({
    data: {
      userId: student1.id,
      organizationId: org.id,
      type: "RESULT_RELEASED",
      title: "Result Released: ML Foundations Comprehensive Assessment",
      message: "Your score: 80.0% (16/20 pts). Instructor feedback has been published.",
      linkUrl: `/student/results/${attemptStudent1.id}`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1.id,
      organizationId: org.id,
      type: "COURSE_PUBLISHED",
      title: "Course Published: Full Stack Web Engineering",
      message: "Welcome to Full Stack Web Engineering! New modules are available.",
      linkUrl: `/student/courses/${courseWeb.id}`,
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher1.id,
      organizationId: org.id,
      type: "ESSAY_AWAITING_GRADING",
      title: "Grading Needed: ML Foundations Comprehensive Assessment",
      message: "Aria Montgomery submitted an attempt with an essay awaiting your evaluation.",
      linkUrl: `/teacher/submissions/${attemptStudent3.id}`,
      isRead: false,
    },
  });

  // 11. System Alerts
  await prisma.alert.create({
    data: {
      organizationId: org.id,
      category: "QUIZ",
      level: "WARNING",
      title: "Assessment Deadline Approaching",
      message: "ML Foundations Comprehensive Assessment closes in 14 days. 4 enrolled students have not started.",
      linkUrl: `/teacher/courses/${courseML.id}`,
    },
  });

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      category: "GRADING",
      level: "INFO",
      title: "1 Submission Awaiting Instructor Review",
      message: "Aria Montgomery submitted an essay question requiring manual grading.",
      linkUrl: `/teacher/submissions/${attemptStudent3.id}`,
    },
  });

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      category: "SYSTEM",
      level: "INFO",
      title: "Storage & Email Adapters Operating in Development Mode",
      message: "Local storage and mock console email adapters are active for offline development.",
    },
  });

  // 12. Audit Events
  await prisma.auditEvent.create({
    data: {
      organizationId: org.id,
      actorId: admin.id,
      action: "MEMBERSHIP_CREATE",
      entityType: "Membership",
      entityId: teacher1.id,
      metadata: JSON.stringify({ role: "TEACHER", name: "Prof. Alexander Ross" }),
    },
  });

  await prisma.auditEvent.create({
    data: {
      organizationId: org.id,
      actorId: teacher1.id,
      action: "COURSE_PUBLISH",
      entityType: "Course",
      entityId: courseML.id,
      metadata: JSON.stringify({ title: "Machine Learning Foundations" }),
    },
  });

  await prisma.auditEvent.create({
    data: {
      organizationId: org.id,
      actorId: teacher1.id,
      action: "QUIZ_PUBLISH",
      entityType: "Quiz",
      entityId: quizML.id,
      metadata: JSON.stringify({ title: quizML.title, version: 1 }),
    },
  });

  console.log("Seeding successfully completed!");
  console.log("Demo credentials:");
  console.log("Admin:   admin@nexora.demo   / NexoraPass2026!");
  console.log("Teacher: teacher@nexora.demo / NexoraPass2026!");
  console.log("Student: student@nexora.demo / NexoraPass2026!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
