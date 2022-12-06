//Email驗證
export function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true
  }
  // alert("You have entered an invalid email address!")
  return false
}

//手機號碼驗證
export function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone))
  {
    return true;
  }
  return false;
}