import os  # 匯入操作系統相關的模組

import requests as r  # 匯入 requests 模組，並簡稱為 r
from dotenv import load_dotenv  # 匯入 dotenv 模組以載入環境變數
from flask import Flask, render_template, url_for
from flask_cors import CORS  # 匯入 CORS 以處理跨來源請求

load_dotenv()  # 載入環境變數，從 .env 檔案中讀取設定
CLIENT_ID = os.getenv("CLIENT_ID")  # 獲取 Twitch 客戶端 ID
CHANNEL_LOGIN = os.getenv("CHANNEL_LOGIN")  # 獲取 Twitch 頻道登入名稱
SHA_256_HASH = os.getenv("SHA_256_HASH")  # 獲取 SHA-256 雜湊值


# 定義每種 chatter 的角色
ROLES = {
    "broadcaster": "實況主",
    "moderator": "Mod",
    "vip": "社群 VIP",
    "staff": "職員",
    "viewer": "觀眾",
}


app = Flask(__name__)  # 建立 Flask 應用程式實例
CORS(app)  # 啟用 CORS 支援，允許跨來源請求


@app.route("/api/data/<channel>")  # 定義 API 路由，當訪問 /api/data 時觸發此函數
def get_channel_chatters(channel):
    url = "https://gql.twitch.tv/gql"  # Twitch GraphQL API 的 URL
    headers = {
        "Client-Id": CLIENT_ID,  # 設定請求標頭中的客戶端 ID
    }
    json = {
        "operationName": "ChatViewers",  # 指定操作名稱，告訴 API 要執行的操作
        "variables": {
            "channelLogin": channel,  # 設定變數為頻道登入名稱，作為查詢的參數
            # "channelLogin": CHANNEL_LOGIN,  # 設定變數為頻道登入名稱，作為查詢的參數
        },
        "extensions": {
            "persistedQuery": {
                "sha256Hash": SHA_256_HASH,  # 設定持久化查詢的 SHA-256 雜湊值，確保查詢的唯一性
                "version": 1,  # 設定版本，表示查詢的版本
            }
        },
    }

    # 發送 POST 請求到 Twitch API，並獲取回應
    response = r.post(url, headers=headers, json=json)

    # 解析回應的 JSON 數據，獲取頻道的 chatters 資料
    data = response.json()["data"]["channel"]["chatters"]

    # 初始化一個空列表，用於存儲所有的 chatter 資訊
    chatters = []

    # 遍歷 ROLES 字典中的每一個角色
    for role in ROLES.keys():
        # 根據角色名稱生成對應的 chatters 名稱，staff 角色不加 s
        role_name = f"{role}s" if role != "staff" else role

        # 獲取對應角色的 chatters 物件
        objects = data[role_name]

        # 遍歷每個 chatter 物件
        for object in objects:
            chatter = {}  # 初始化一個空字典來存儲 chatter 的資訊

            # 將 chatter 的名稱設置為 login
            chatter["name"] = object["login"]
            # 將 chatter 的角色設置為當前的 role
            chatter["role"] = role

            # 將 chatter 資訊添加到 chatters 列表中
            chatters.append(chatter)

    return chatters


@app.route("/")  # 定義根路由，當訪問根 URL 時觸發此函數
@app.route("/<channel>")  # 新增網址參數 channel
def index(channel=CHANNEL_LOGIN):
    # 設置頁面標題，包含頻道登入名稱
    title = f"Twitch Chatters Monitor - {channel}"

    # 生成角色配置字典，包含每個角色的顯示文本和對應的圖片路徑
    role_config = {
        key: {
            "displayText": value,  # 角色的顯示文本
            "imagePath": url_for(
                "static", filename=f"images/{key}.png"
            ),  # 角色圖片的靜態路徑
        }
        for key, value in ROLES.items()  # 遍歷 ROLES 字典中的每一個角色
    }

    # 渲染 index.html 模板，並傳遞標題和角色配置
    return render_template(
        "index.html", title=title, role_config=role_config, channel=channel
    )


if __name__ == "__main__":  # 檢查是否為主程式
    app.run(debug=True)  # 啟動 Flask 應用程式，並開啟除錯模式，方便開發時檢查錯誤
