import { useCheckAuthMutation } from "@/app/store/apis/AuthApi";
import { useAppDispatch } from "@/app/store/hooks";
import { logout, setUser } from "@/app/store/slices/AuthSlice";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [triggerCheckAuth] = useCheckAuthMutation();

  useEffect(() => {
    (async () => {
      try {
        const response = await triggerCheckAuth().unwrap();
        // The backend returns { success, message, user }
        const user = response.user;
        if (user) {
          dispatch(setUser({ user }));
        } else {
          console.error("No user data in response");
          dispatch(logout());
        }
      } catch (error: any) {
        console.log("error: ", error);
        // ✅ If it's a 401, user is unauthenticated — expected
        if (error?.status === 401) {
          dispatch(logout());
        } else {
          console.error("Unexpected error during auth", error);
        }
      }
    })();
  }, []);

  return <>{children}</>;
}
