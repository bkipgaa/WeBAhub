@echo off
start "Frontend" cmd /k "cd Frontend\weba-hub && npm start"
start "Backend" cmd /k "cd Backend && npm run dev"
start "Admin" cmd /k "cd Admin\admin && npm start"
