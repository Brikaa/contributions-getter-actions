for i in "test" "yo" "../HAHAH"; do
    node scripts/checkSafePath.js "$(pwd)" "$i"
done
