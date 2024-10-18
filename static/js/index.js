$(() => {
    // 發送請求以獲取數據
    function fetchData() {
        fetch(`/api/data/${channel}`)
            .then((response) => response.json()) // 將回應轉換為 JSON 格式
            .then((data) => {
                // 初始化 DevExtreme DataGrid
                $("#gridContainer")
                    .dxDataGrid({
                        dataSource: data, // 設置數據源為獲取的數據
                        allowColumnReordering: true, // 允許列重新排序
                        width: "100%", // 設置寬度為 100%
                        showBorders: true, // 顯示邊框
                        hoverStateEnabled: true, // 啟用懸停狀態
                        grouping: {
                            autoExpandAll: true, // 自動展開所有分組
                            expandMode: "rowClick",
                        },
                        searchPanel: {
                            visible: true, // 顯示搜索面板
                        },
                        paging: {
                            pageSize: 25, // 每頁顯示 25 條數據
                        },
                        groupPanel: {
                            visible: true, // 顯示分組面板
                        },
                        selection: {
                            mode: "single", // 單選模式
                        },
                        columns: [
                            {
                                dataField: "role", // 設置列的數據字段為 "role"
                                caption: "角色", // 列的標題
                                groupIndex: 0, // 設置為第一個分組列
                                groupCellTemplate: (element, options) =>
                                    setCellTemplate(element, options), // 使用自定義的單元格模板
                                cellTemplate: (element, options) =>
                                    setCellTemplate(element, options), // 使用自定義的單元格模板
                            },
                            {
                                dataField: "name", // 設置列的數據字段為 "name"
                                caption: "名稱", // 列的標題
                                allowGrouping: false, // 不允許對此列進行分組
                                cellTemplate(container, options) {
                                    // 自定義單元格模板，生成超連結
                                    return $("<a>", {
                                        href: `https://www.twitch.tv/${options.value}`, // 設置超連結的 URL
                                        target: "_blank", // 在新標籤頁中打開
                                    }).text(options.value); // 設置超連結的文本為名稱
                                },
                            },
                        ],
                        sortByGroupSummaryInfo: [{ summaryItem: "count" }],
                        summary: {
                            groupItems: [
                                { column: "role", summaryType: "count" },
                            ],
                        },
                    })
                    .dxDataGrid("instance"); // 獲取 DataGrid 實例
            })
            .catch((error) => {
                // 捕獲並顯示錯誤
                console.error("Error fetching data:", error);
            });
    }

    // 初始呼叫
    fetchData();

    // 每 5 秒呼叫一次 API
    setInterval(fetchData, 5000); // 5000 毫秒

    // 自定義單元格模板函數
    function setCellTemplate(element, options) {
        const displayText = roleConfig[options.value].displayText; // 獲取顯示文本
        element.text(displayText); // 設置單元格的文本

        const imagePath = roleConfig[options.value].imagePath; // 獲取圖片路徑
        const $image = $("<img>", {
            src: `${imagePath}`, // 設置圖片的 src
            alt: `${displayText}`, // 設置圖片的 alt 屬性
            style: "width: 20px; height: 20px; margin-right: 10px", // 設置圖片樣式
        });
        element
            .prepend($image) // 將圖片插入到單元格的開頭
            .css("display", "flex") // 設置單元格為彈性盒子
            .css("align-items", "center"); // 垂直置中單元格內的內容
    }
});
