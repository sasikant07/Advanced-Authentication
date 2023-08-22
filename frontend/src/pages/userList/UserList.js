import React, { useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import "./UserList.scss";
import Pagemenu from "../../components/pageMenu/Pagemenu";
import UserStats from "../../components/userStats/UserStats";
import Search from "../../components/serach/Search";
import ChangeRole from "../../components/changeRole/ChangeRole";
import useRedirectLoggedOutUser from "../../customHook/useRedirectLoggedOutUser";
import { getUsers } from "../../redux/features/auth/authSlice";
import { shortenText } from "../profile/Profile";
import { Spinner } from "../../components/loader/Loader";

const UserList = () => {
  useRedirectLoggedOutUser("/login");
  const {users, isLoading, isLoggedIn, isSuccess, message} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  return (
    <section>
      <div className="container">
        <Pagemenu />
        <UserStats />

        <div className="user-list">
          {isLoading && <Spinner />}
          <div className="table">
            <div className="--flex-between">
              <span>
                <h3>All Users</h3>
              </span>
              <span>
                <Search />
              </span>
            </div>
            {/* Table */}
            {!isLoading && users.length === 0 ? (
              <p>No user found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>s/n</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const {_id, name, email, role} = user;
                    return (
                      <tr key={_id}>
                        <td>{index + 1}</td>
                        <td>{shortenText(name, 8)}</td>
                        <td>{email}</td>
                        <td>{role}</td>
                        <td>
                          <ChangeRole />
                        </td>
                        <td>
                          <span>
                            <FaTrashAlt size={20} color="red" />  
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserList;
