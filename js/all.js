// import file
import { validateEmail, validatePhone } from "./validate.js";
import { sewlDelAllFn } from "./vendors.js";

const productList = document.querySelector(".product-lists"); //HTML元素-產品列表
const selectProduct = document.querySelector(".bedType"); //HTML元素-產品分類
const cartList = document.querySelector(".js-cartList"); //HTML元素-購物車列表
const cartTotalAmount = document.querySelector(".js-cartTotalAmount"); //HTML元素-購物車總金額
const btnDeleteAllCartItems = document.querySelector(".js-deleteAllBtn"); //HTML元素-按鈕【刪除所有品項】(購物車)
const reserveForm = document.querySelector("#reserveForm"); //HTML元素-表單【填寫預訂資料】
const btnReserve = document.querySelector("#btnReserve"); //HTML元素-按鈕【送出預訂資料】
let productData = []; //宣告一個陣列，用於存放產品項目
let cartData = []; //宣告一個陣列，用於存放購物車項目


function init(){
  getProductList();  //取得產品列表
  getCartList();  //取得購物車列表
}

init(); //初始化

// 取得所有產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res)=>{
      // console.log(res.data.products);
      productData = res.data.products;
      renderProductList(productData);
    }).catch((error)=>{
      console.log(error.response);
    })
}

// 渲染產品列表
function renderProductList(data){
  // console.log(productData);
  let str = "";
  data.forEach((item)=>{
    str += `<li class="col">
      <div class="card rounded-0">
        <div>
          <img src="${item.images}" class="card-img-top rounded-0 position-relative" alt="product-01">
          <div class="position-absolute product-label fs-4 bg-primary text-white px-6 py-2">新品</div>
        </div>
        <div class="card-body">
          <a href="#" class="btn btn-primary d-block rounded-0 fs-4 mb-2 hover-bg-secondary" data-id="${item.id}">加入購物車</a>
          <h5 class="card-title fs-4 mb-2">${item.title}</h5>
          <div class="d-flex flex-column">
            <span class="fs-4"><del>NT$${separator(item.origin_price)}</del></span>
            <span class="fs-2">NT$${separator(item.price)}</span>
          </div>
        </div>
      </div>
    </li>`;
  })
  productList.innerHTML = str;
}

// 依產品類別篩選
selectProduct.addEventListener('change', (e)=>{
  e.preventDefault(); //取消觸發事件預設行為
  // console.log(e.target.value);
  let productCategory = e.target.value;
  if(productCategory === "全部"){
    renderProductList(productData); //重新渲染產品列表
  }else{
    const filterData = productData.filter((item)=>{ //透過陣列filter還做篩選 (陣列filter方法是 淺拷貝)
      return item.category === productCategory;
    })
    // console.log(filterData);
    renderProductList(filterData); //重新渲染產品列表
  }
})

// 點擊【加入購物車】，將產品項目加入購物車
productList.addEventListener('click', (e)=>{
  e.preventDefault();
  // console.log(e.target); //印出點擊到HTML哪個元素
  // console.log(e.target.getAttribute("data-id")); //印出點擊到HTML元素上有屬性data-id的值 (這裡是產品ID)
  let productId = e.target.getAttribute("data-id");
  if(productId !== null){
    addProductToCart(productId);
  }
})

// 產品加入購物車
function addProductToCart(productId) {
  let itemNum = 1; //產品數量, 預設 1 筆
  cartData.forEach((item)=>{
    if(item.product.id === productId) {
      itemNum = ++item.quantity; //將已存在購物車中的項目數量+1
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": itemNum
    }
  })
  .then((res)=>{
    // console.log(res.data);
    swal("成功", "加入一個品項到購物車", "success");
    renderCartList(res.data);
  }).catch((error)=>{
    console.log(error);
  })
}

// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res)=>{
      // console.log(res.data);
      renderCartList(res.data);
    }).catch((error)=>{
      console.log(error.response);
    })
}

// 重新渲染購物車列表
function renderCartList(responseData) {
  // console.log(responseData);
  cartData = responseData.carts; //購物車清單 (陣列格式)
  let finalTotal = responseData.finalTotal; //購物車總金額 (後端幫忙計算)
  let str = ""; //宣告一個字串，用於組HTML字串
  cartData.forEach((item)=>{
    str += `<tr>
      <td>
        <div class="d-flex align-items-center">
          <img class="table-carts-img" src="${item.product.images}">
          <p class="ms-4">${item.product.title}</p>
        </div>
      </td>
      <td>NT$${separator(item.product.price)}</td>
      <td>
        <div class="d-flex justify-content-between align-items-center border rounded-2">
          <span class="material-icons text-primary align-bottom">
            <button type="button" class="btn btn-primary border-0 hover-bg-secondary js-reduceCart" data-num="${item.quantity}" data-cartId="${item.id}">remove</button>
          </span>
          <div class="px-2">${item.quantity}</div>
          <span class="material-icons text-primary align-bottom">
            <button type="button" class="btn btn-primary border-0 hover-bg-secondary js-addCart" data-num="${item.quantity}" data-cartId="${item.id}">add</button>
          </span>
        </div>
      </td>
      <td>NT$${separator(item.product.price * item.quantity)}</td>
      <td>
        <a href="#" class="material-icons hover-link-opacity p-3 js-deleteCartItem" data-cartId="${item.id}">
          clear
        </a>
      </td>
    </tr>`;
  })
  cartList.innerHTML = str; //渲染HTML畫面(購物車列表)
  cartTotalAmount.innerHTML = `<td class="fs-4 fs-lg-2 js-cartTotalAmount">NT$${separator(finalTotal)}</td>`; //渲染HTML畫面(購物車總金額)
}

// 監聽-購物車列表
cartList.addEventListener('click', (e) => {
  e.preventDefault(); //取消觸發事件預設行為
  // console.log(e.target.getAttribute("data-cartId")); //印出點擊到HTML元素上有屬性data-id的值 (這裡是購物車ID)
  const targetClass = e.target.getAttribute("class");
  if(targetClass === null){
    return;
  }
  if(targetClass.indexOf("js-reduceCart") !== -1 || targetClass.indexOf("js-addCart") !== -1){ //點到按鈕【-】or【+】 (購物車數量修改數量)
    let itemNum = parseInt(e.target.getAttribute("data-num"));
    let cartId = e.target.getAttribute("data-cartId");
    changeCartItemNum(targetClass, cartId, itemNum);
  }else if(targetClass.indexOf("js-deleteCartItem") !== -1){ //點擊到按鈕【刪除】，則執行刪除品項邏輯
    let cartId = e.target.getAttribute("data-cartId");
    if(cartId !== null){
      deleteCartItem(cartId);
    }
  }
})

//購物車-修改數量
function changeCartItemNum(targetClass, cartId, itemNum){
  if(targetClass.indexOf("js-reduceCart") !== -1){ //按鈕【-】
    if(itemNum-1 < 1) {
      swal("產品數量不能小於1", "請重新確認!", "info");
    }else{
      itemNum -= 1;
    }
  }else if(targetClass.indexOf("js-addCart") !== -1){ //按鈕【+】
    itemNum += 1;
  }
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "id": cartId,
      "quantity": parseInt(itemNum)
    }
  })
  .then((res)=>{
    // console.log(res.data);
    renderCartList(res.data);  //重新渲染購物車
  }).catch((error)=>{
    console.log(error);
  })
}

// 購物車-刪除特定項目
function deleteCartItem(cartId) {
  // console.log(cartId);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/hungya/carts/${cartId}`)
    .then((res)=>{
      // console.log(res.data);
      swal("成功", "刪除了一筆購物車項目", "success");
      renderCartList(res.data);  //重新渲染購物車
    }).catch((error)=>{
      console.log(error);
    })
}

// 購物車-清空購物車
function delAllCartItem (){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/hungya/carts`)
  .then((res)=>{
    // console.log(res.data);
    swal("成功", "刪除購物車所有品項成功", "success");
    renderCartList(res.data);  //重新渲染購物車
  }).catch((error)=>{
    console.log(error);
  })
}

// 清空購物車
//監聽 HTML元素-按鈕【刪除所有品項】
btnDeleteAllCartItems.addEventListener('click', (e)=>{
  // console.log(e.target);
  if(cartData.length === 0){
    swal("購物車目前無任何品項", "請勿重複點擊!", "info");
    return;
  }
  sewlDelAllFn('購物車內的所有商品', '購物車', delAllCartItem);
})



// 送出訂單
// 取得HTML元素的值
const inputName = document.querySelector("#inputName");  //姓名
const inputTel = document.querySelector("#inputTel");  //電話
const inputEmail = document.querySelector("#inputEmail");  //E-mail
const inputAddress = document.querySelector("#inputAddress");  //寄送地址
const inputTrade = document.querySelector("#inputTrade");  //交易方式
// 監聽 姓名欄位
inputName.addEventListener('blur', (e)=>{
  if(e.target.value !== ""){
    inputName.nextElementSibling.textContent = ""; //<p>標籤訊息 清空
  }else{
    inputName.nextElementSibling.textContent = "必填";
  }
})
// 監聽 Email欄位
inputEmail.addEventListener('blur', (e)=>{
  // 驗證 Email格式
  if(e.target.value !== ""){
    if(validateEmail(e.target.value)){
      inputEmail.nextElementSibling.textContent = ""; //<p>標籤訊息 清空
    }else{
      inputEmail.nextElementSibling.textContent = "請填寫正確E-mail格式，如: abc123@gmail.com";
    }
  }else{
    inputEmail.nextElementSibling.textContent = "必填";
  }
})
// 監聽 電話
inputTel.addEventListener('blur', (e)=>{
  // 驗證 手機號碼 格式
  if(e.target.value !== ""){
    if(validatePhone(e.target.value)){
      inputTel.nextElementSibling.textContent = ""; //<p>標籤訊息 清空
    }else{
      inputTel.nextElementSibling.textContent = "請填寫正確手機格式，10碼數字如: 0921xxxxxx";
    }
  }else{
    inputTel.nextElementSibling.textContent = "必填";
  }
})
// 監聽 寄送地址欄位
inputAddress.addEventListener('blur', (e)=>{
  if(e.target.value !== ""){
    inputAddress.nextElementSibling.textContent = ""; //<p>標籤訊息 清空
  }else{
    inputAddress.nextElementSibling.textContent = "必填";
  }
})


// 監聽-按鈕【送出預訂資料】
btnReserve.addEventListener('click', (e)=>{
  e.preventDefault();
  // console.log(e.target);
  // 先檢查購物車有無資料
  if(cartData.length === 0){
    swal("請先選擇產品加入購物車!", "購物車目前無資料", "info");
    return;
  }
  //宣告一個陣列， 用於驗證HTML元素是否有對應提示訊息
  let arrInput = [
    inputName,
    inputTel,
    inputEmail,
    inputAddress,
  ];
  // 檢查表單欄位是否有提示訊息，有驗證訊息則跳出alert提示
  if(checkOrderFormValidate(arrInput) !== ""){
    swal("欄位未填寫完整", "【填寫預訂資料】有欄位未填寫完整，請確認!", "info");
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
    "data": {
      "user": {
        "name": inputName.value,
        "tel": inputTel.value,
        "email": inputEmail.value,
        "address": inputAddress.value,
        "payment": inputTrade.value
      }
    }
  }).then((res)=>{
    // console.log(res.data);
    reserveForm.reset(); //清空表單輸入欄位資料
    renderFormDefaultMsg(arrInput); //重新刷新表單預設提示訊息
    getCartList();  //重新渲染購物車 (購物車會呈現清空狀態，因後端程式做了清空購物車功能)
    swal("送出訂單成功", "", "success");
  }).catch((error)=>{
    console.log(error);
  })
})

// 檢查預訂資料表單是否有提示訊息，有則回傳
function checkOrderFormValidate(arrInput){
  let validateMsg = ""; //宣告一個字串，用於組驗證訊息
  arrInput.forEach((item)=>{
    // console.log(item.nextElementSibling);
    validateMsg += item.nextElementSibling.textContent;  //組驗證訊息字串
  })
  // console.log(validateMsg);
  return validateMsg;
}

//重新刷新表單預設提示訊息
function renderFormDefaultMsg(arrInput) {
  arrInput.forEach((item)=>{
    item.nextElementSibling.textContent = "必填";
  })
}

//數字 三位一撇
function separator(numb) {
  var str = numb.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}