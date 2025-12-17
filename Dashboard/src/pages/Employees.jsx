import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeList from "../components/EmployeeList";
import CreateEmployeeModal from "../components/CreateEmployee"
import toast from "react-hot-toast";
import ManageEmployeeModal from "../components/ManageEmployee";
import { addEmployee, getEmployees as getEmployeesHttp, activateOrDeactivate } from "../features/services/EmployeeService"

export default function Employees() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [employee, setEmployee] = useState("");
    const [open, setOpen] = useState(false);
    const [isManage, setIsManage] = useState(false);
    const [employees, setEmployees] = useState("");

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    const employeesList = async () => {
        const data = await getEmployeesHttp()
        setEmployees(data)
    }

    useEffect(() => {
        employeesList();
    }, [])

    const handleCreateEmployee = async (form) => {
        try {
            await addEmployee(form)
            employeesList();
            setOpen(false)
        } catch (err) {
            console.log(err)
            toast("failed to create employee")
        }
    }

    const onManage = (emp) => {
        setEmployee(emp)
        setIsManage(true)
    }

    const onChangeRole = () => {

    }

    const onClose = () => {
        setIsManage(false)
    }

    const onOpenChat = () => {

    }

    const onToggleStatus = async (manageUser) => {
        const status = manageUser.isActive === true ? "deactivate" : "activate";
        
        try {
            await activateOrDeactivate({ employeeId: manageUser.userId, status })
            setIsManage(false)
            setEmployee("")      
            await employeesList()
        } catch (err) {
            console.log(err)
            toast.error(`Failed to ${status}.`)
        }
    }

    const isOwn = user?.user.id === employee?.userId;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">

            <ManageEmployeeModal
                employee={employee}
                onChangeRole={onChangeRole}
                onClose={onClose}
                onOpenChat={onOpenChat}
                onToggleStatus={onToggleStatus}
                open={isManage}
                isOwn={isOwn}
            />

            <CreateEmployeeModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreateEmployee}
            // loading={loading}
            />

            <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">

                <button
                    onClick={() => setOpen(true)}
                    className="bg-gray-300 text-black px-3 py-1 mb-2 rounded hover:bg-gray-200">
                    Create Employee
                </button>
                {/* <div>
                    <span>    The default password for all employees is :
                        <span class="font-medium"> EmployeeName012 </span></span>
                </div> */}

                <EmployeeList isOwn={(id) => user?.user.id === id} employees={employees} onManage={onManage} />
            </section>
        </div>
    );
}
