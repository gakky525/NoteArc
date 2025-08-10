# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ作成
WORKDIR /app

# 依存関係を先にインストール
COPY package.json package-lock.json* ./ 

RUN npm install

# ソースコードをコピー
COPY . .

EXPOSE 3000

# Next.jsの開発サーバー起動
CMD ["npm", "run", "dev"]
