import axios from 'axios';

interface ResetResult {
  success: boolean;
  message?: string;
  details?: any;
}

export const ResetService = {
  resetAll: async (): Promise<ResetResult> => {
    // Backend README specifies this endpoint is a GET (not POST). Using POST was causing 404.
    const url = 'http://localhost:5000/api/task/reset-data';
    const method = 'GET';
    try {
      const res = await axios.get(url);
      if (res.data && typeof res.data === 'object') {
        return {
          success: true,
          message: (res.data.message as string) || 'Reset işlemi tamamlandı.',
          details: res.data
        };
      }
      return { success: true, message: 'Reset işlemi tamamlandı.' };
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      const fallback = status === 404
        ? 'Reset endpoint bulunamadı (404).'
        : status === 401 || status === 403
          ? 'Yetki reddedildi. (401/403)'
          : 'Reset isteği başarısız oldu.';
      const message = serverMsg || fallback;
      // Geliştiriciye yardımcı olması için denenen method ve URL'i ekliyoruz.
      throw new Error(`${message} [${method} ${url}${status ? ' status=' + status : ''}]`);
    }
  }
};
