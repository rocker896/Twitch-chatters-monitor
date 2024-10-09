import os  # 匯入操作系統相關的模組

import requests as r  # 匯入 requests 模組，並簡稱為 r
from dotenv import load_dotenv  # 匯入 dotenv 模組以載入環境變數
from flask import Flask, jsonify  # 匯入 Flask 和 jsonify 以建立網頁應用程式和回傳 JSON
from flask_cors import CORS  # 匯入 CORS 以處理跨來源請求

app = Flask(__name__)  # 建立 Flask 應用程式實例
CORS(app)  # 啟用 CORS 支援，允許跨來源請求

load_dotenv()  # 載入環境變數，從 .env 檔案中讀取設定
CLIENT_ID = os.getenv("CLIENT_ID")  # 獲取 Twitch 客戶端 ID
CHANNEL_LOGIN = os.getenv("CHANNEL_LOGIN")  # 獲取 Twitch 頻道登入名稱
SHA_256_HASH = os.getenv("SHA_256_HASH")  # 獲取 SHA-256 雜湊值


@app.route("/api/data")  # 定義 API 路由，當訪問 /api/data 時觸發此函數
def get_data():
    url = "https://gql.twitch.tv/gql"  # Twitch GraphQL API 的 URL
    headers = {
        "Client-Id": CLIENT_ID,  # 設定請求標頭中的客戶端 ID
    }
    json = {
        "operationName": "ChatViewers",  # 指定操作名稱，告訴 API 要執行的操作
        "variables": {
            "channelLogin": CHANNEL_LOGIN,  # 設定變數為頻道登入名稱，作為查詢的參數
        },
        "extensions": {
            "persistedQuery": {
                "sha256Hash": SHA_256_HASH,  # 設定持久化查詢的 SHA-256 雜湊值，確保查詢的唯一性
                "version": 1,  # 設定版本，表示查詢的版本
            }
        },
    }

    response = r.post(
        url, headers=headers, json=json
    )  # 發送 POST 請求到 Twitch API，並獲取回應
    return jsonify(response.json())  # 將回應轉換為 JSON 格式並回傳


if __name__ == "__main__":  # 檢查是否為主程式
    app.run(debug=True)  # 啟動 Flask 應用程式，並開啟除錯模式，方便開發時檢查錯誤
