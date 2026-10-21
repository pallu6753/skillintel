# SkillIntel Dataset & Database Implementation Bundle

## Contents
- `schema_supabase_postgres.sql`: PostgreSQL/Supabase starter schema for all four domains and AI modules.
- `student_roster_30.csv` / `.json`: exactly 30 real student records from the supplied SEEL login-details workbook.
- `student_academic_analytics_template_30.json`: same 30 students with GPA/CGPA/semester values left blank pending verified institutional data.
- `quiz_questions_sample_20.csv` / `.json`: 20 curated starter questions, not a 500-question production bank. Trainer review is required before graded use.
- `coding_problems_sample.json`: original demonstration problems; hidden test cases are deliberately not included in client-facing data.
- `parsed_resumes_synthetic_demo.json`: fictional examples; no real student resume contents.
- `interview_sessions_synthetic_demo.json`: fictional transcripts with scores left blank until evaluated.
- `career_paths_sample_10.json` / `.csv`: 10 starter role pathways; these are not represented as a complete 50+ verified catalog.
- `job_postings_synthetic_demo.json`: clearly marked demo job listings, not real vacancies.
- `data_dictionary.md`: purpose and notes for core fields.

## Important safety and quality notes
- Do not seed made-up GPA, CGPA, marks, readiness scores, ATS scores, job demand scores, or real vacancy URLs.
- `Faker` should only create synthetic demo profiles and text. It does not generate valid educational questions or verified answer keys.
- Review licensing, attribution, and usage restrictions before importing public datasets.
- Store private resumes and hidden coding test cases in protected server-side storage.
- The SQL file is a schema starter. It is not a production migration and intentionally does not enable all RLS policies. Review table names against the existing application, then implement and test RLS before using sensitive data.
- Supabase Auth user IDs are UUIDs. Create auth users through Supabase Auth; do not insert passwords into `profiles`.
- Job data needs source, last-verified time, and expiry handling.
