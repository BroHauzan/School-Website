# Aturan Publish ke GitHub

Setiap kali pengguna meminta untuk melakukan commit, push, atau mengunggah perubahan ke GitHub:
1. Agen **WAJIB** membaca dan menjalankan prosedur pada skill `publish-to-github` ([.agents/skills/publish-to-github/SKILL.md](../skills/publish-to-github/SKILL.md)).
2. Agen **TIDAK BOLEH** langsung melakukan `git push` sebelum menjalankan tahapan pemeriksaan (build check, git status & diff check, serta sinkronisasi penyesuaian `README.md`).
