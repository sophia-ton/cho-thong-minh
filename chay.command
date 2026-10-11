#!/bin/bash
# Nhấp đúp để cài đặt và chạy prototype Chợ Thông Minh Đà Nẵng
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then echo "Chưa có Node.js. Tải tại https://nodejs.org (bản LTS) rồi chạy lại."; read -n 1; exit 1; fi
[ -d node_modules ] || npm install
npm run dev -- --open
