# NoteArc バックアップ / 復元手順

## 1) 毎日バックアップ（既に自動化済み）

- 実行スクリプト: /usr/local/bin/notearc-backup.sh
- 保存先: gdrive:backups/notearc
- 保持: 30 日

## 2) 復元テスト（毎月）

- スクリプト: ~/notearc-restore-test.sh
- 実行スケジュール: LaunchAgent com.notearc.restore-test (毎月 1 日 03:00)
- テスト DB: mongodb://localhost:27017/notearc_restore_test

## 3) 重要ファイル

- ~/.notearc/backup.env (chmod 600)
- ~/Library/LaunchAgents/com.notearc.backup.plist
- ~/Library/LaunchAgents/com.notearc.restore-test.plist

## 4) 復元手順（手動）

1. rclone で最新バックアップを取得:
   REMOTE=$(grep ^REMOTE ~/.notearc/backup.env | cut -d"'" -f2)
   rclone lsjson "${REMOTE}" --fast-list | jq -r 'sort_by(.ModTime) | last | .Path'
   rclone copy "${REMOTE}/<最新ファイル名>" .

2. gpg で復号:
   export BACKUP_PASSPHRASE=$(grep ^BACKUP_PASSPHRASE ~/.notearc/backup.env | cut -d"'" -f2)
   gpg --batch --yes --pinentry-mode loopback --passphrase "${BACKUP_PASSPHRASE}" -o ./test-decrypted.archive.gz --decrypt "<最新ファイル名>.gpg"

3. mongorestore で別 DB へ復元（テスト DB へ）:
   mongorestore --uri="mongodb://localhost:27017" --archive=test-decrypted.archive.gz --gzip --nsFrom='notearc._' --nsTo='notearc_restore_test._' --drop --verbose

4. 結果を確認:
   mongosh "mongodb://localhost:27017" --eval 'const d=db.getSiblingDB("notearc_restore_test"); d.getCollectionNames().forEach(c=>print(c+":"+d.getCollection(c).countDocuments()));'

5. 平文ファイルを削除:
   rm -f test-decrypted.archive.gz

## 5) 運用ルール（必須）

- GPG パスフレーズは必ずパスワードマネージャ等に保管する。
- ログ（~/Library/Logs/notearc-backup.log, notearc-restore-test.log）を毎月確認する（最低：月次）。
- 自動復元テストが失敗したら即対応（ログを保存して、復元できる状態を回復する）。

## 6) 備考

- バックアップは小規模でも必須。復元手順を用意しておくこと。
- 「バックアップできている」ではなく「復元できる」ことを常に重視すること。
