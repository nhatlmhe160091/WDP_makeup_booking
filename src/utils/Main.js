/**
 * Hàm tính ngày bảo trì dự kiến
 * @param {string} createdAt - Ngày tạo (dưới dạng chuỗi, ví dụ: "2024-11-08T05:01:24.376Z")
 * @param {number} daysToMaintain - Số lượng ngày bảo trì
 * @returns {string} - Ngày bảo trì dự kiến (dưới dạng "dd/MM/yyyy")
 */
export function calculateMaintenanceDate(createdAt, daysToMaintain) {
  // convert daysToMaintain if it's not a number
  if (typeof daysToMaintain !== "number") {
    daysToMaintain = Number(daysToMaintain);
  }

  // nếu createdAt không phải là một chuỗi thì chuyển nó về chuỗi
  if (typeof createdAt !== "string") {
    createdAt = createdAt.toString();
  }

  const creationDate = new Date(createdAt);
  const maintenanceDate = new Date(creationDate);

  // Cộng thêm số ngày bảo trì vào ngày tạo
  maintenanceDate.setDate(maintenanceDate.getDate() + daysToMaintain);

  // Định dạng lại ngày bảo trì theo "dd/MM/yyyy"
  const formattedDate = maintenanceDate.toLocaleDateString("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });

  return formattedDate;
}

export function calculateMaintenanceDateRaw(createdAt, daysToMaintain) {
  // convert daysToMaintain if it's not a number
  if (typeof daysToMaintain !== "number") {
    daysToMaintain = Number(daysToMaintain);
  }

  const creationDate = new Date(createdAt);
  const maintenanceDate = new Date(creationDate);

  // Cộng thêm số ngày bảo trì vào ngày tạo
  maintenanceDate.setDate(maintenanceDate.getDate() + daysToMaintain);
  return maintenanceDate;
}

export const convertDateTime = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const convertDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
};

export const formatCurrency = (input, currency = "VND") => {
  // Chuyển đổi chuỗi sang số nếu input là chuỗi
  let amount = input;
  try {
    amount = parseFloat(input.toString().replace(/[^0-9.-]+/g, ""));
  } catch (e) {
    amount = 0;
  }

  // Kiểm tra nếu không phải số hợp lệ thì trả về 0 VND
  if (isNaN(amount) || amount <= 0) return "0 " + currency;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};
