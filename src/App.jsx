import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import './App.css'
import Mainlayout from './layouts/Mainlayout';
import Homepage from "./pages/Homepage";
import Attendance from "./pages/Attendance";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import NotFoundPage from "./pages/NotFoundPage"



const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path='/' element={<Mainlayout />}>
      <Route index element={<Homepage />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/class" element={<Classes />} />
      <Route path="/students" element={<Students />} />
    </Route>

      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);
const App = () => {
  return (
     <RouterProvider router={router}/>
  
  )
}

export default App
