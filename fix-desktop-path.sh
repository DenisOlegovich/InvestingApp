#!/bin/bash
# Исправление: EACCES: permission denied, mkdir '/Users/Desktop'
# при "Apply worktree to current branch" в Cursor.
# Решение: sudo ln -s /Users/denis/Desktop /Users/Desktop

[ -e /Users/Desktop ] && echo "Симлинк уже есть: $(ls -la /Users/Desktop)" && exit 0
ln -s /Users/denis/Desktop /Users/Desktop && echo "Готово: /Users/Desktop -> /Users/denis/Desktop"
exit $?
