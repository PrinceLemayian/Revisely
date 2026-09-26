import bcrypt from "bcryptjs";
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requiredSeedSecret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set before running the demo seed.`);
  return value;
}

const pdf = Buffer.from(`%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 58>>stream
BT /F1 18 Tf 40 88 Td (Revisely demo academic resource) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000230 00000 n 
0000000339 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
409
%%EOF`);

async function writeDemoFile(key: string) {
  const fullPath = path.resolve(
    process.env.LOCAL_UPLOAD_DIR ?? "./uploads",
    key,
  );
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, pdf);
  await writeFile(`${fullPath}.type`, "application/pdf");
}

async function main() {
  // Keep demo credentials out of source control and reset both demo roles when seeding.
  const adminEmail = process.env.DEMO_ADMIN_EMAIL ?? "admin@revisely.test";
  const studentEmail = process.env.DEMO_STUDENT_EMAIL ?? "student@revisely.test";
  const adminPasswordHash = await bcrypt.hash(requiredSeedSecret("DEMO_ADMIN_PASSWORD"), 12);
  const studentPasswordHash = await bcrypt.hash(requiredSeedSecret("DEMO_STUDENT_PASSWORD"), 12);

  const resourceTypes = await Promise.all(
    [
      ["Lecture Notes", "lecture-notes"],
      ["Past Papers", "past-papers"],
      ["CATs", "cats"],
      ["Assignments", "assignments"],
      ["Revision Materials", "revision-materials"],
      ["Handouts", "handouts"],
      ["Study Guides", "study-guides"],
      ["Other", "other"],
    ].map(([name, slug]) =>
      prisma.resourceType.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      }),
    ),
  );

  const [year2024, year2023] = await Promise.all(
    ["2024/2025", "2023/2024"].map((label) =>
      prisma.academicYear.upsert({
        where: { label },
        update: {},
        create: { label },
      }),
    ),
  );
  const [semester1, semester2] = await Promise.all(
    ["Semester 1", "Semester 2"].map((name) =>
      prisma.semester.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const scit = await prisma.school.upsert({
    where: { code: "SCIT" },
    update: {},
    create: { code: "SCIT", name: "School of Computer Science & IT" },
  });
  const business = await prisma.school.upsert({
    where: { code: "SOB" },
    update: {},
    create: { code: "SOB", name: "School of Business" },
  });

  const cs = await prisma.department.upsert({
    where: { schoolId_code: { schoolId: scit.id, code: "CS" } },
    update: {},
    create: {
      schoolId: scit.id,
      code: "CS",
      name: "Department of Computer Science",
    },
  });
  const it = await prisma.department.upsert({
    where: { schoolId_code: { schoolId: scit.id, code: "IT" } },
    update: {},
    create: {
      schoolId: scit.id,
      code: "IT",
      name: "Department of Information Technology",
    },
  });
  const finance = await prisma.department.upsert({
    where: { schoolId_code: { schoolId: business.id, code: "FIN" } },
    update: {},
    create: {
      schoolId: business.id,
      code: "FIN",
      name: "Department of Finance",
    },
  });

  const bscCs = await prisma.program.upsert({
    where: { departmentId_code: { departmentId: cs.id, code: "BSCS" } },
    update: {},
    create: {
      departmentId: cs.id,
      code: "BSCS",
      name: "BSc. Computer Science",
    },
  });
  const bscIt = await prisma.program.upsert({
    where: { departmentId_code: { departmentId: it.id, code: "BSIT" } },
    update: {},
    create: {
      departmentId: it.id,
      code: "BSIT",
      name: "BSc. Information Technology",
    },
  });
  const bcom = await prisma.program.upsert({
    where: { departmentId_code: { departmentId: finance.id, code: "BCOM" } },
    update: {},
    create: {
      departmentId: finance.id,
      code: "BCOM",
      name: "Bachelor of Commerce",
    },
  });

  const units = await Promise.all([
    prisma.unit.upsert({
      where: { code: "CSC220" },
      update: {},
      create: {
        programId: bscCs.id,
        code: "CSC220",
        name: "Database Systems",
        description:
          "Relational design, SQL, normalization, indexing, transactions, and database administration.",
      },
    }),
    prisma.unit.upsert({
      where: { code: "CSC310" },
      update: {},
      create: {
        programId: bscCs.id,
        code: "CSC310",
        name: "Operating Systems",
        description:
          "Processes, memory management, scheduling, filesystems, and concurrency.",
      },
    }),
    prisma.unit.upsert({
      where: { code: "BIT205" },
      update: {},
      create: {
        programId: bscIt.id,
        code: "BIT205",
        name: "Web Application Development",
        description:
          "Modern web application architecture, APIs, and frontend engineering.",
      },
    }),
    prisma.unit.upsert({
      where: { code: "FIN201" },
      update: {},
      create: {
        programId: bcom.id,
        code: "FIN201",
        name: "Corporate Finance",
        description:
          "Capital budgeting, risk, valuation, and financing decisions.",
      },
    }),
  ]);

  const [admin, student] = await Promise.all([
    prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminPasswordHash, role: "admin" },
      create: {
        name: "Admin Amina",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        schoolId: scit.id,
        programId: bscCs.id,
      },
    }),
    prisma.user.upsert({
      where: { email: studentEmail },
      update: { passwordHash: studentPasswordHash, role: "student" },
      create: {
        name: "Student Otieno",
        email: studentEmail,
        passwordHash: studentPasswordHash,
        role: "student",
        schoolId: scit.id,
        programId: bscCs.id,
      },
    }),
  ]);

  const typeBySlug = Object.fromEntries(
    resourceTypes.map((type) => [type.slug, type]),
  );
  const resources = [
    [
      "Database Systems 2024 Past Paper",
      "Past examination paper covering SQL joins, normalization, indexing, and transactions.",
      units[0],
      typeBySlug["past-papers"],
      year2024,
      semester2,
    ],
    [
      "Database Systems CAT 1 Revision Pack",
      "Practice CAT questions and answer guide for entity relationship modeling and SQL queries.",
      units[0],
      typeBySlug.cats,
      year2023,
      semester1,
    ],
    [
      "Database Systems Lecture Notes Week 1-6",
      "Lecture notes for relational modeling, normalization, and query design.",
      units[0],
      typeBySlug["lecture-notes"],
      year2024,
      semester1,
    ],
    [
      "Operating Systems 2023 Past Paper",
      "Past examination paper on process scheduling, deadlocks, memory, and filesystems.",
      units[1],
      typeBySlug["past-papers"],
      year2023,
      semester2,
    ],
    [
      "Operating Systems Process Scheduling Handout",
      "Handout with scheduling algorithms, worked examples, and comparison tables.",
      units[1],
      typeBySlug.handouts,
      year2024,
      semester1,
    ],
    [
      "Web Application Development Assignment 2",
      "Assignment brief for building a typed REST API and responsive frontend.",
      units[2],
      typeBySlug.assignments,
      year2024,
      semester2,
    ],
    [
      "Corporate Finance Study Guide",
      "Study guide for time value of money, capital budgeting, and valuation basics.",
      units[3],
      typeBySlug["study-guides"],
      year2023,
      semester1,
    ],
  ] as const;

  for (const [title, description, unit, type, year, semester] of resources) {
    const key = `resources/${unit.id}/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
    await writeDemoFile(key);
    await prisma.resource.upsert({
      where: { storageKey: key },
      update: {},
      create: {
        title,
        description,
        unitId: unit.id,
        resourceTypeId: type.id,
        academicYearId: year.id,
        semesterId: semester.id,
        storageKey: key,
        fileName: `${title}.pdf`,
        fileType: "application/pdf",
        fileSizeBytes: pdf.length,
        uploadedById: admin.id,
        status: "published",
        downloadCount: Math.floor(Math.random() * 35),
        viewCount: 20 + Math.floor(Math.random() * 80),
      },
    });
  }

  await prisma.bookmark.upsert({
    where: {
      userId_resourceId: {
        userId: student.id,
        resourceId: (
          await prisma.resource.findFirstOrThrow({
            where: { title: "Database Systems 2024 Past Paper" },
          })
        ).id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      resourceId: (
        await prisma.resource.findFirstOrThrow({
          where: { title: "Database Systems 2024 Past Paper" },
        })
      ).id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
