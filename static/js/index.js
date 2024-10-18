$(() => {
    function fetchData() {
        // 發送請求以獲取頻道的聊天者資料
        fetch(`/api/data/${channel}`)
            .then((response) => response.json())
            .then((data) => {
                // 初始化資料表格
                $("#gridContainer")
                    .dxDataGrid({
                        dataSource: data, // 設定資料來源
                        allowColumnReordering: true, // 允許重新排序欄位
                        width: "100%", // 設定寬度為 100%
                        showBorders: true, // 顯示邊框
                        hoverStateEnabled: true, // 啟用懸停狀態
                        grouping: {
                            autoExpandAll: true, // 自動展開所有分組
                            expandMode: "rowClick", // 點擊行展開
                        },
                        searchPanel: {
                            visible: true, // 顯示搜尋面板
                        },
                        paging: {
                            pageSize: 25, // 每頁顯示 25 筆資料
                        },
                        groupPanel: {
                            visible: true, // 顯示分組面板
                        },
                        selection: {
                            mode: "single", // 單選模式
                        },
                        columns: [
                            {
                                dataField: "role", // 角色欄位
                                caption: "角色", // 欄位標題
                                groupIndex: 0, // 設定為第一個分組欄位
                                groupCellTemplate: (element, options) =>
                                    setCellTemplate(element, options), // 自定義分組單元格模板
                                cellTemplate: (element, options) =>
                                    setCellTemplate(element, options), // 自定義單元格模板
                            },
                            {
                                dataField: "name", // 名稱欄位
                                caption: "名稱", // 欄位標題
                                allowGrouping: false, // 不允許分組
                                cellTemplate(container, options) {
                                    // 自定義單元格模板，生成超連結
                                    return $("<a>", {
                                        href: `https://www.twitch.tv/${options.value}`,
                                        target: "_blank", // 在新標籤頁中打開
                                    }).text(options.value);
                                },
                            },
                        ],
                        sortByGroupSummaryInfo: [{ summaryItem: "count" }], // 根據分組摘要資訊排序
                        summary: {
                            groupItems: [
                                { column: "role", summaryType: "count" }, // 計算每個角色的數量
                            ],
                        },
                        toolbar: {
                            items: [
                                "groupPanel", // 顯示分組面板
                                "searchPanel", // 顯示搜尋面板
                                {
                                    location: "after", // 在其他項目之後顯示
                                    widget: "dxButton", // 使用 DevExtreme 按鈕
                                    options: {
                                        icon: "refresh", // 刷新圖示
                                        onClick() {
                                            fetchData(); // 點擊時重新獲取資料
                                        },
                                    },
                                },
                            ],
                        },
                    })
                    .dxDataGrid("instance"); // 獲取資料表格實例
            })
            .catch((error) => {
                console.error("Error fetching data:", error); // 錯誤處理
            });
    }

    fetchData(); // 初始獲取資料
    setInterval(fetchData, 5000); // 每 5 秒重新獲取資料

    function setCellTemplate(element, options) {
        // 設定單元格模板，顯示角色名稱和圖片
        const displayText = roleConfig[options.value].displayText; // 取得顯示文字
        element.text(displayText); // 設定單元格文字

        const imagePath = roleConfig[options.value].imagePath; // 取得圖片路徑
        const $image = $("<img>", {
            src: `${imagePath}`, // 設定圖片來源
            alt: `${displayText}`, // 設定圖片替代文字
            style: "width: 20px; height: 20px; margin-right: 10px", // 設定圖片樣式
        });
        element
            .prepend($image) // 在單元格前面添加圖片
            .css("display", "flex") // 設定顯示為彈性盒子
            .css("align-items", "center"); // 垂直置中對齊
    }
});
