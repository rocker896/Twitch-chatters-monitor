import os

import requests as r
from dotenv import load_dotenv
from flask import Flask, render_template, url_for
from flask_cors import CORS

load_dotenv()  # 載入環境變數
CLIENT_ID = os.getenv("CLIENT_ID")  # 取得客戶端 ID
CHANNEL_LOGIN = os.getenv("CHANNEL_LOGIN")  # 取得頻道登入名稱
SHA_256_HASH = os.getenv("SHA_256_HASH")  # 取得 SHA-256 雜湊值

ROLES = {
    "broadcaster": "實況主",
    "moderator": "Mod",
    "vip": "社群 VIP",
    "staff": "職員",
    "viewer": "觀眾",
}


app = Flask(__name__)  # 初始化 Flask 應用
CORS(app)  # 啟用跨來源資源共享


@app.route("/")
@app.route("/<channel>")
def index(channel=CHANNEL_LOGIN):
    title = f"Twitch Chatters Monitor - {channel}"  # 設定頁面標題
    role_config = {
        key: {
            "displayText": value,  # 角色顯示文字
            "imagePath": url_for(
                "static", filename=f"images/{key}.png"
            ),  # 角色圖片路徑
        }
        for key, value in ROLES.items()  # 遍歷角色設定
    }

    return render_template(
        "index.html", title=title, role_config=role_config, channel=channel  # 渲染模板
    )


@app.route("/api/chatters/<channel>")
def get_channel_chatters(channel):
    url = "https://gql.twitch.tv/gql"  # Twitch GraphQL API URL
    headers = {
        "Client-Id": CLIENT_ID,  # 設定請求標頭中的客戶端 ID
    }
    json = {
        "operationName": "ChatViewers",  # GraphQL 操作名稱
        "variables": {
            "channelLogin": channel,  # 頻道登入名稱作為變數
        },
        "extensions": {
            "persistedQuery": {
                "sha256Hash": SHA_256_HASH,  # 使用的 SHA-256 雜湊值
                "version": 1,  # 查詢版本
            }
        },
    }

    response = r.post(url, headers=headers, json=json)  # 發送 POST 請求
    data = response.json()["data"]["channel"]["chatters"]  # 解析回應中的聊天者資料

    chatters = []  # 儲存聊天者資訊的列表
    for role in ROLES.keys():  # 遍歷角色
        role_name = f"{role}s" if role != "staff" else role  # 確定角色名稱
        objects = data[role_name]  # 取得該角色的聊天者

        for object in objects:  # 遍歷聊天者
            chatter = {}
            chatter["name"] = object["login"]  # 取得聊天者名稱
            chatter["role"] = role  # 設定聊天者角色
            chatters.append(chatter)  # 將聊天者資訊加入列表

    count = data["count"]
    chatters_info = {
        "chatters": chatters,
        "count": count,
    }

    return chatters_info  # 回傳聊天者資訊


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)  # 啟動應用，開啟除錯模式
