<!-- install dulu guys/ pastikan udah masuk ke folder ml-service -->
pip install -r requirements.txt

<!-- Jalankan mesinya guys :) -->
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

<!-- Bisa dicek statusnya di browser -->
http://localhost:8000/health
http://localhost:8000/docs