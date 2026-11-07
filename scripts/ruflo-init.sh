#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../agent-workspace"
if ! command -v npx >/dev/null 2>&1; then
  echo 'Node.js 20+ და npm/npx საჭიროა Ruflo-სთვის.' >&2
  exit 1
fi
echo 'Ruflo-ის ოფიციალური initializer ამ საქაღალდეში გაეშვება.'
npx -y ruflo@latest init
printf '\nშემდეგი ნაბიჯი: AI მოდელის კლიენტის დაკავშირება Ruflo-ის MCP-თან.\n'
