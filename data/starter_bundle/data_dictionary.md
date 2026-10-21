# SkillIntel Core Data Dictionary

| Table / file | Key fields | Purpose | Quality / privacy rule |
|---|---|---|---|
| profiles | user_id, usn, full_name, email, department | Auth-linked user profile | UUID matches `auth.users`; USN unique; never store passwords |
| user_roles | user_id, role, assigned_by | Student/teacher/placement/admin role mapping | Role changes are authorized and audited |
| academic_records | user_id, semester, sgpa, cgpa, credits | Academic analytics | Values 0–10 where applicable; blank until institutionally verified |
| skills / student_skills | skill_id, canonical_name, proficiency | Skill taxonomy and candidate skills | Normalize aliases; distinguish claimed from verified |
| quiz_questions | question_id, category, difficulty, options, correct_option_index | MCQ bank | Answer index must be within options; trainer review before grading |
| quiz_attempts | user_id, question_id, selected_option, is_correct | Assessment history | Students may access only their own attempts |
| coding_problems | problem_id, statement, visible_test_cases, hidden_test_cases_ref | Coding challenge bank | Hidden tests and editorial stay server-side |
| coding_submissions | user_id, problem_id, code, language, status | Code submission history | Execute only in a sandbox; resource limits required |
| resumes | user_id, storage_path, extracted_skills, ats_score | Resume analysis | Private storage; score needs documented scoring version |
| mock_interviews | user_id, prompt, transcript, rubric scores | Interview practice | Consent for recordings; scores 0–100 if used |
| career_paths | path_id, role_title, required_skills | Career path catalogue | Demand score only when sourced and timestamped |
| job_postings | job_id, title, company, skills, source_url, last_verified_at | Job discovery | Verify source and expiry; demo jobs must not appear as live |
| applications | user_id, job_id, status, approval timestamp | Job tracking | User review/approval before submission |
| cohorts / teacher_assignments | cohort_id, student_user_id, teacher_user_id | Teacher domain | Teachers access only assigned cohorts |
| training_tasks / task_submissions | task_id, student_user_id, score, feedback | Training delivery | Audit reviewer and keep student data scoped |
| placement_drives / eligibility_rules | drive_id, job_id, criteria | Placement workflow | Criteria sourced from official notices |
| placement_participants / outcomes | student_user_id, stage, outcome | Placement tracking | Restrict access; outcomes should be verified |
| audit_logs | actor, action, entity, timestamp | Admin governance | Append-only in production; sensitive reads and exports audited |
