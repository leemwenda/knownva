/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function writePlaceholderPdf(relativePath, title) {
  const storageDir = path.resolve(process.cwd(), process.env.STORAGE_DIR || "./storage");
  const fullPath = path.join(storageDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const content = `%PDF-1.4\n% KnowVa sample placeholder document\n% Title: ${title}\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF`;
  fs.writeFileSync(fullPath, content, "utf-8");
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // --- Superadmin bootstrap account ---
    const adminEmail = "admin@knowva.app";
    const adminPassword = "Admin@12345";
    const { rows: existingAdmin } = await client.query("select id from users where email = $1", [adminEmail]);

    if (existingAdmin.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      const { rows } = await client.query(
        `insert into users (name, email, password_hash, role, status, email_verified)
         values ($1, $2, $3, 'superadmin', 'active', true) returning id`,
        ["KnowVa Super Admin", adminEmail, hash],
      );
      await client.query(
        `insert into subscriptions (user_id, plan, status) values ($1, 'premium', 'active')`,
        [rows[0].id],
      );
      console.log(`Created superadmin account -> ${adminEmail} / ${adminPassword}`);
    } else {
      console.log("Superadmin account already exists, skipping.");
    }

    // --- Demo lecturer + student accounts (useful for quick manual testing) ---
    const demoUsers = [
      { name: "Dr. Amina Kiptoo", email: "lecturer@knowva.app", password: "Lecturer@123", role: "lecturer", institution: "University of Nairobi" },
      { name: "Brian Otieno", email: "student@knowva.app", password: "Student@123", role: "student", institution: "University of Nairobi" },
    ];
    const demoIds = {};
    for (const u of demoUsers) {
      const { rows } = await client.query("select id from users where email = $1", [u.email]);
      if (rows.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        const { rows: created } = await client.query(
          `insert into users (name, email, password_hash, role, status, email_verified, institution)
           values ($1, $2, $3, $4, 'active', true, $5) returning id`,
          [u.name, u.email, hash, u.role, u.institution],
        );
        await client.query(`insert into subscriptions (user_id, plan, status) values ($1, 'free', 'active')`, [
          created[0].id,
        ]);
        demoIds[u.role] = created[0].id;
        console.log(`Created demo ${u.role} account -> ${u.email} / ${u.password}`);
      } else {
        demoIds[u.role] = rows[0].id;
        console.log(`Demo ${u.role} account already exists, skipping.`);
      }
    }

    // --- Academic structure ---
    const institutions = [
      "University of Nairobi",
      "Kenyatta University",
      "Jomo Kenyatta University of Agriculture and Technology",
      "Strathmore University",
      "Moi University",
    ];
    const fields = ["Computer Science", "Business Administration", "Engineering", "Medicine", "Law", "Education"];
    const levels = ["Certificate", "Diploma", "Undergraduate", "Masters", "PhD"];

    const institutionIds = {};
    for (const name of institutions) {
      const { rows } = await client.query(
        `insert into institutions (name) values ($1) on conflict (name) do update set name = excluded.name returning id`,
        [name],
      );
      institutionIds[name] = rows[0].id;
    }

    const fieldIds = {};
    for (const name of fields) {
      const { rows } = await client.query(
        `insert into fields (name) values ($1) on conflict (name) do update set name = excluded.name returning id`,
        [name],
      );
      fieldIds[name] = rows[0].id;
    }

    const levelIds = {};
    for (const name of levels) {
      const { rows } = await client.query(
        `insert into levels (name) values ($1) on conflict (name) do update set name = excluded.name returning id`,
        [name],
      );
      levelIds[name] = rows[0].id;
    }

    const unitDefs = [
      { name: "Data Structures and Algorithms", field: "Computer Science", level: "Undergraduate" },
      { name: "Database Systems", field: "Computer Science", level: "Undergraduate" },
      { name: "Principles of Marketing", field: "Business Administration", level: "Undergraduate" },
      { name: "Thermodynamics", field: "Engineering", level: "Undergraduate" },
      { name: "Human Anatomy", field: "Medicine", level: "Undergraduate" },
      { name: "Constitutional Law", field: "Law", level: "Undergraduate" },
      { name: "Advanced Machine Learning", field: "Computer Science", level: "Masters" },
    ];
    const unitIds = {};
    for (const u of unitDefs) {
      const { rows: existingUnit } = await client.query("select id from units where name = $1", [u.name]);
      if (existingUnit.length === 0) {
        const { rows } = await client.query(
          `insert into units (name, field_id, level_id) values ($1, $2, $3) returning id`,
          [u.name, fieldIds[u.field], levelIds[u.level]],
        );
        unitIds[u.name] = rows[0].id;
      } else {
        unitIds[u.name] = existingUnit[0].id;
      }
    }

    // --- Sample approved notes (metadata only; no binary file needed for listing demo) ---
    const { rows: noteCountRows } = await client.query("select count(*)::int as count from notes");
    if (noteCountRows[0].count === 0 && demoIds.lecturer) {
      const sampleNotes = [
        {
          title: "Introduction to Data Structures",
          description: "Comprehensive lecture notes covering arrays, linked lists, stacks, and queues with worked examples.",
          unit: "Data Structures and Algorithms",
          field: "Computer Science",
          level: "Undergraduate",
          premium: false,
        },
        {
          title: "Relational Database Design Deep Dive",
          description: "Covers normalization, ER diagrams, indexing strategies and transaction isolation levels.",
          unit: "Database Systems",
          field: "Computer Science",
          level: "Undergraduate",
          premium: true,
        },
        {
          title: "Marketing Mix Strategies (4Ps)",
          description: "A practical breakdown of product, price, place and promotion strategy with case studies.",
          unit: "Principles of Marketing",
          field: "Business Administration",
          level: "Undergraduate",
          premium: false,
        },
      ];

      for (const n of sampleNotes) {
        const relPath = `notes/placeholder-${n.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
        writePlaceholderPdf(relPath, n.title);
        await client.query(
          `insert into notes
            (title, description, institution_id, field_id, level_id, unit_id, semester, academic_year,
             resource_type, is_premium, file_name, file_path, file_size, file_mime, status, uploader_id,
             reviewed_by, reviewed_at, downloads_count, views_count, rating_sum, rating_count)
           values ($1,$2,$3,$4,$5,$6,'Semester 1','2024/2025','Notes',$7,$8,$9,120000,'application/pdf','approved',$10,$10,now(),12,54,18,4)`,
          [
            n.title,
            n.description,
            institutionIds["University of Nairobi"],
            fieldIds[n.field],
            levelIds[n.level],
            unitIds[n.unit],
            n.premium,
            `${n.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`,
            `notes/placeholder-${n.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`,
            demoIds.lecturer,
          ],
        );
      }
      console.log(`Seeded ${sampleNotes.length} sample approved notes.`);
    } else {
      console.log("Notes already exist, skipping sample notes.");
    }

    console.log("Seed complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
