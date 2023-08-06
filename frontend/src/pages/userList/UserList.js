import React from 'react';
import "./UserList.scss";
import Pagemenu from '../../components/pageMenu/Pagemenu';
import UserStats from '../../components/userStats/UserStats';
import Search from '../../components/serach/Search';

const UserList = () => {
  return (
    <section>
        <div className="container">
            <Pagemenu />
            <UserStats />
            <div className="user-list">
                <div className="--flex-between">
                    <span>
                        <h3>All Users</h3>
                    </span>
                    <span>
                        <Search />
                    </span>
                </div>
            </div>
        </div>
    </section>
  )
}

export default UserList;