export async function sendOtpEsms(phoneNumber, otpCode) {
  const url = "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/";

  const payload = {
    ApiKey: process.env.ESMS_API_KEY,
    SecretKey: process.env.ESMS_SECRET_KEY,
    Content: `${otpCode} la ma xac minh dang ky Baotrixemay cua ban`,
    Phone: phoneNumber,
    Brandname: "Baotrixemay",
    SmsType: "2",
    Sandbox: "1" // Bỏ khi chạy production
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}
