import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Default Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@capacityconnect.com" },
    update: {},
    create: {
      email: "admin@capacityconnect.com",
      name: "System Administrator",
      password: passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const trainer = await prisma.user.upsert({
    where: { email: "trainer@capacityconnect.com" },
    update: {},
    create: {
      email: "trainer@capacityconnect.com",
      name: "Senior Trainer Alex",
      password: passwordHash,
      role: "TRAINER",
      emailVerified: new Date(),
    },
  });

  const trainee = await prisma.user.upsert({
    where: { email: "trainee@capacityconnect.com" },
    update: {},
    create: {
      email: "trainee@capacityconnect.com",
      name: "Jordan Trainee",
      password: passwordHash,
      role: "TRAINEE",
      emailVerified: new Date(),
    },
  });

  console.log("Users created:", {
    admin: admin.email,
    trainer: trainer.email,
    trainee: trainee.email,
  });

  // 2. Create Platform Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to Capacity Connect Platform",
      content:
        "We are pleased to introduce the updated Digital Capacity Building and Learning Management Portal. Explore our courses and track your development certifications.",
      authorId: admin.id,
    },
  });

  // 3. Create Sample Course
  const existingCourse = await prisma.course.findFirst({
    where: { trainerId: trainer.id, title: "Cloud Architecture & Security Foundations" },
  });

  let course = existingCourse;
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Cloud Architecture & Security Foundations",
        description:
          "Master core principles of resilient cloud computing, identity and access management, and infrastructure protection.",
        trainerId: trainer.id,
        modules: {
          create: [
            {
              title: "Module 1: Introduction to Cloud Infrastructure",
              content:
                "Cloud computing provides on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.",
              order: 1,
            },
            {
              title: "Module 2: Identity, Roles & Least Privilege",
              content:
                "Implementing least privilege access ensures that each identity possesses only the minimum necessary permissions to perform its intended workload functions.",
              order: 2,
            },
            {
              title: "Module 3: Continuous Monitoring & Incident Response",
              content:
                "Observability platforms collect metrics, logs, and traces to detect anomalies and trigger automated containment policies.",
              order: 3,
            },
          ],
        },
        assessments: {
          create: [
            {
              title: "Foundations Mastery Quiz",
              questions: {
                create: [
                  {
                    text: "What principle ensures users only have permissions required for their tasks?",
                    options: {
                      create: [
                        { text: "Principle of Least Privilege", isCorrect: true },
                        { text: "Principle of Maximum Redundancy", isCorrect: false },
                        { text: "Dynamic Overprovisioning", isCorrect: false },
                        { text: "Unrestricted Elevation", isCorrect: false },
                      ],
                    },
                  },
                  {
                    text: "Which telemetry signal is crucial for tracking service call latency across microservices?",
                    options: {
                      create: [
                        { text: "Distributed Tracing", isCorrect: true },
                        { text: "Static Heap Dump", isCorrect: false },
                        { text: "Local Syslog", isCorrect: false },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  // 4. Enroll Trainee
  if (course) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: trainee.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: trainee.id,
        courseId: course.id,
        status: "ACTIVE",
        progress: 33,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
