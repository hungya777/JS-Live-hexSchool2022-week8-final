// swiper套件
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.esm.browser.min.js';

const swiperDefault = new Swiper(".swiper-recommand", {
  slidesPerView: 1,
  spaceBetween: 30,
  breakpoints: {
    767: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    1200: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
  },
});


// sweet alert
// 提示視窗 sewlFn('訂單加入成功', 'success');
function sewlFn(title, icon, time) {
  // success 成功, error 錯誤, warning 驚嘆號 , info 說明i
  swal({
    title: title,
    icon: icon,
    button: false,
    timer: time,
  })
}

// 提示視窗 - 全部刪除
export function sewlDelAllFn(txt, delBtnTxt, executeFn){
  swal({
    title: '是否要全部刪除？',
    text: `按下確認刪除後，將刪除${txt}。`,
    icon: 'warning',
    buttons: ['取消', '確認刪除'],
    dangerMode: true,
  })
  .then(function(willDelete) {
    if (willDelete) {
      sewlFn(`${delBtnTxt}已全部刪除`, 'success', 1000);
      executeFn();
    } else {
      sewlFn('動作已取消', 'warning', 1000);
      return;
    }
  });
}

//圓餅圖
//參數
//arrData: 統計後資料
//eid: HTML元素id
export function renderPieChar(arrData ,eid){
  let pieChart = c3.generate({
    bindto: `#${eid}`, // HTML 元素綁定
    data: {
      columns: arrData, // 資料存放
      type:"pie" // 圖表種類
    }
  }); 
}

//長條圖 (c3.js)
//參數
//arrData: 統計後資料
//eid: HTML元素id
export function renderBarChat(arrData, eid){
  const barChart = c3.generate({
      bindto: `#${eid}`,
      data: {
          columns: arrData,
          type: 'bar'
      },
      bar: {
          // width: {
          //     ratio: 0.5 // this makes bar width 50% of length between ticks
          // }
          // or
          width: 100 // this makes bar width 100px
      },
  });  
}