export function objectToFormData<T extends Record<string, any>>(
  obj: T,
  formData = new FormData(),
  parentKey = '',
): FormData {
  Object.entries(obj).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        objectToFormData({ [`${key}[${index}]`]: item }, formData);
      });
    } else if (typeof value === 'object' && value !== null) {
      objectToFormData(value, formData, formKey);
    } else if (value !== undefined && value !== null) {
      formData.append(formKey, String(value));
    }
  });

  return formData;
}
