import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../redux/features/auth/authService";
import { toast } from "react-toastify";

const useRedirectLoggedOutUser = (path) => {
    const navigate = useNavigate();

    useEffect(() => {
        let isLoogedIn;
        const redirectLoggedOutUser = async () => {
            try {
                isLoogedIn = await authService.getLoginStatus();
            } catch (error) {
                console.log(error.message);
            }
        }

        if (!isLoogedIn) {
            toast.info("Session Expired, Please login to continue");
            navigate(path);
            return;
        }
        
        redirectLoggedOutUser();
    }, [path, navigate]);
}

export default useRedirectLoggedOutUser;