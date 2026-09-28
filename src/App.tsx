import AppRoutes from "./routes/AppRoutes"
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#10191a",
            color: "#e7efec",
            border: "1px solid #3b514e",
            fontSize: "16px",
            minHeight: "52px",
            minWidth: "280px",
            padding: "14px 18px",
          },
        }}
      />
      <AppRoutes />
    </>
  )
}

export default App
