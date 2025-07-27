import { ToastPosition, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

const defaultToastOptions = {
    position: 'bottom-right' as ToastPosition,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
    progress: undefined,
};

export const showToast = (
    message: string,
    type: ToastType = ToastType.SUCCESS,
) => {
    console.log(typeof message);

    switch (type) {
        case ToastType.SUCCESS:
            toast.success(message, defaultToastOptions);
            break;
        case ToastType.ERROR:
            toast.error(message, defaultToastOptions);
            break;
        case ToastType.WARNING:
            toast.warning(message, defaultToastOptions);
            break;
        case ToastType.INFO:
            toast.info(message, defaultToastOptions);
            break;
        default:
            break;
    }
};
