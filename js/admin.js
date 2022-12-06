import { sewlDelAllFn, renderPieChar, renderBarChat} from "./vendors.js";

// headers
const headers = {
  headers: {
    'Authorization': token
  }
};

const orderList = document.querySelector(".js-orderList"); //HTML元素-訂單列表
const btnDeleteCartItem = document.querySelector(".js-deleteCartItem"); //HTML元素-按鈕【刪除】 (用於刪除單筆訂單)
const btnDeleteAllCartItems = document.querySelector(".js-deleteAllOrdersBtn"); //HTML元素-按鈕【清除全部訂單】
const selRevenueRatio = document.querySelector(".js-select-revenueRatio"); //HTML元素-選單 (營收比重)
let orderData = []; //宣告一個陣列，用於存放訂單列表

function init() {
  getOrderList();
}

init(); //初始化

// 取得訂單列表
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, headers)
    .then((res)=>{
      // console.log(res.data.orders);
      orderData = res.data.orders;
      renderOrderList(orderData);
      getCategoryRevenueRatio();
      // getProductRevenueRatio();
    })
    .catch((error)=>{
      console.log(error);
    })
}

//渲染訂單列表 
function renderOrderList(orderData) {
  let str = "";  //宣告一個字串，用於組HTML字串
  orderData.forEach((item)=>{
    //組訂單項目字串
    let strProduct = ""; //宣告一個字串，用於組訂單項目
    item.products.forEach((item, index)=>{
      // console.log(item);
      strProduct += `<p>${index+1}. ${item.title} X ${item.quantity}</p>`;
    })
    //組時間字串
    const thisStamp = new Date(item.createdAt*1000);
    const orderTime = `${thisStamp.getFullYear()}/${thisStamp.getMonth()+1}/${thisStamp.getDate()}`;
    str += `<tr>
      <td>${item.id}</td>
      <td>${item.user.name}<br>${item.user.tel}</td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>${strProduct}</td>
      <td>${orderTime}</td>
      <td>
        <a href="#" class="text-link text-decoration-underline js-changeStatus" data-orderStatus="${item.paid}" data-orderId="${item.id}">${item.paid? "已處理": "未處理"}</a>
      </td>
      <td>
        <input class="btn btn-danger rounded-0 js-deleteCartItem" data-orderId="${item.id}" type="button" value="刪除">
      </td>
    </tr>`;
  })
  orderList.innerHTML = str;
}

// 監聽-訂單列表
orderList.addEventListener('click', (e)=>{
  e.preventDefault(); //取消觸發事件預設行為
  // console.log(e.target);
  // 點擊到訂單狀態的元素
  const targetClass = e.target.getAttribute("class");
  let orderId = e.target.getAttribute("data-orderId");
  // console.log(targetClass);
  if(targetClass.indexOf("js-changeStatus") != -1){ //改變訂單狀態
    let orderStatus = e.target.getAttribute("data-orderStatus");
    let newStatus;
    if(orderStatus == "true"){
      newStatus = false;
    }else{
      newStatus = true;
    }
    changeOrderStatus(orderId, newStatus);
  }else if(targetClass.indexOf("js-deleteCartItem") != -1){ //刪除一筆訂單
    deleteCartItem(orderId);
  }
})

// 改變訂單狀態
function changeOrderStatus(orderId, orderStatus){
  // console.log(id, orderStatus);
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    "data": {
      "id": orderId,
      "paid": orderStatus
    }
  },headers).then((res)=>{
    // console.log(res.data);
    getOrderList(); //重新取得訂單列表
    swal("成功修改訂單狀態", "", "success");
  }).catch((error)=>{
    console.log(error);
  })
}

//訂單-刪除一筆訂單資料
function deleteCartItem(orderId){
  // console.log(orderId);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/hungya/orders/${orderId}`,headers).then((res)=>{
      // console.log(res);
      getOrderList();
      swal("成功", "成功刪除一筆訂單", "success");
    }).catch((error)=>{
      console.log(error);
    })
}

//訂單-清空訂單列表
function delAllOrderItem(){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/hungya/orders`,headers)
  .then((res)=>{
    // console.log(res);
    getOrderList();
  }).catch((error)=>{
    console.log(error);
  })
}

// 監聽-按鈕【清除全部訂單】
btnDeleteAllCartItems.addEventListener('click', (e)=>{
  e.preventDefault(); //取消觸發事件預設行為
  if(orderData.length == 0) {
    swal("目前無任何訂單資料", "", "warning");
    return;
  }
  sewlDelAllFn('訂單清單內所有訂單', '訂單清單', delAllOrderItem);
})

// 取得全產品類別營收比重
function getCategoryRevenueRatio() {
  let objCategoryRevenue = {}; //宣告一個物件，用於統計各產品類別營收
  // console.log(orderData);
  orderData.forEach((item)=>{
    item.products.forEach((productItem)=>{
      // console.log(obj[productItem.category]);
      if(objCategoryRevenue[productItem.category] == undefined){
        objCategoryRevenue[productItem.category] = productItem.price * productItem.quantity;
      }else{
        objCategoryRevenue[productItem.category] += productItem.price * productItem.quantity;
      }
    })
  })
  // console.log(objCategoryRevenue);
  // 將物件轉成c3.js需要的陣列格式
  let arrCategoryRevenue = Object.entries(objCategoryRevenue);
  // console.log(arrCategoryRevenue);
  renderBarChat(arrCategoryRevenue ,"barChart");
  renderPieChar(arrCategoryRevenue ,"pieChart");
}

// 取得全品項營收比重
function getProductRevenueRatio() {
  let objProductRevenue = {}; //宣告一個物件，用於統計各別產品營收
  orderData.forEach((item)=> {
    item.products.forEach((productItem)=> {
      if(objProductRevenue[productItem.title] == undefined) {
        objProductRevenue[productItem.title] = productItem.price * productItem.quantity;
      } else {
        objProductRevenue[productItem.title] += productItem.price * productItem.quantity;
      }
    })
  })
  // console.log(objProductRevenue);

  // 將物件資料轉成陣列格式，才能使用陣列方法 sort()做排序
  let arrProductRevenue = Object.entries(objProductRevenue); //如: ['Louvre 雙人床架／雙人加大', 18000]
  // console.log(arrProductRevenue);
  arrProductRevenue.sort((a, b)=>{
    return b[1]-a[1]; //金額由 高->低 排序; (備註用b[1]跟a[1]取陣列格式index為1的資料是為了取出金額做比對)
  })

  // 將物件資料轉成 c3.js可用的陣列格式資料
  // 組新的陣列: 類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
  let newArrProductRevenue = []; //宣告一個新的陣列，用來存放新組的陣列資料
  let objOther = {"其他": 0}; //宣告一個物件，用來統計營收品項4名之後的「其它」項目的營收加總
  arrProductRevenue.forEach((item, index)=>{
    if(index < 3) {
      newArrProductRevenue.push(item);
    } else {
      // console.log(item[1]);
      objOther["其他"] += item[1];
      if(index == arrProductRevenue.length-1) { //統計到陣列最後一筆，將「其他」品項放到新陣列中
        newArrProductRevenue.push(Object.entries(objOther)[0]); //將objOther物件透過Object.entries轉成陣列格式資料
      }
    }
  })
  // console.log(newArrProductRevenue);
  renderBarChat(newArrProductRevenue, "barChart");
  renderPieChar(newArrProductRevenue, "pieChart");
}

// 營收比重項目切換
selRevenueRatio.addEventListener('change', (e)=>{
  // console.log(e.target.value);
  if(e.target.value == "全產品類別營收比重"){
    getCategoryRevenueRatio();
  }else{
    getProductRevenueRatio();
  }
})