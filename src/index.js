import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs, Icon, Menu, Dropdown, Button } from "antd";
import "./index.css";
const TabPane = Tabs.TabPane;

class TopMenu extends Component {
    state = {
        panes: [],           //此处引用menus组件的第一个为起始页
        activeUrl: ''
    }
    componentDidMount() {
        this.listenHistory = this.props.history.listen(e => {
            this.onListenHistory(e)
        })
        this.initSessionStrange()
    }
    componentWillUnmount() {
        this.unListenHistory()
    }
    unListenHistory() {                                            //---移除对路由的监听
        if (this.listenHistory) {
            this.listenHistory()
            this.listenHistory = null
        }
    }
    findTree(list=[], route) {
        let result = null
        const find = (_list) => {
            if(result) return;

            _list.forEach(item => {
                if (item.children) {
                    find(item.children)
                } else if(item.url === route.pathname) {
                    result = item
                }
            })
        }
        find(list)
        return result
    }
    onListenHistory = e => {                                             //---监听路由
        const currentRouter = this.findTree(this.props.route, e)

        
        if (currentRouter) {
            this.setState(state => {
                !state.panes.find(pane => pane.url === currentRouter.url) && state.panes.push(currentRouter)
                state.activeUrl = currentRouter.url
                return state
            }, () => {
                this.setSessionStrange()
            })
        }
    }
    onChange = (activeUrl) => {                                         //---监听tabs 切换
        this.setState({ activeUrl });
        this.props.history.push(activeUrl)
    }
    onEdit = (targetKey, action) => {                                   //---监听tabs 新增 和 移除
        if (action === 'remove') {
            // 如果关闭的是当前项,则需要跳转新路由
            if (this.props.location.pathname === targetKey) {
                let currentRemoveIndex = this.state.panes.findIndex(e => e.url === targetKey)

                // 如果是最后一个 , 则跳转到当前项的前一个, 否则跳转后一个
                if (currentRemoveIndex === this.state.panes.length - 1) {
                    this.props.history.push(this.state.panes[currentRemoveIndex - 1].url)
                } else {
                    this.props.history.push(this.state.panes[currentRemoveIndex + 1].url)
                }
            }
            this.setState(e => {
                e.panes = e.panes.filter(e => e.url !== targetKey)
                return e
            }, this.setSessionStrange)
        }
    }
    setSessionStrange = () => {                                           //---设置State到缓存中
        let currentState = JSON.stringify(this.state)
        sessionStorage.setItem('layout_top_menu_state', currentState);
    }
    initSessionStrange = () => {                                        //---设置缓存数据到State中
        let topMenuState = sessionStorage.getItem('layout_top_menu_state');
        if (!topMenuState) {
            this.onListenHistory({ pathname: this.props.location.pathname })
            return false
        }

        try {
            topMenuState = JSON.parse(topMenuState)
            this.setState({ ...topMenuState })
        } catch (error) {

        }
    }
    handleShowAction = (e) => {                                          //---监听右侧菜单事件
        if (e.key === '0') {
            window.location.reload()
        } else if (e.key === '1') {
            this.onEdit(this.state.activeUrl, 'remove')
        } else if (e.key === '2') {
            this.setState(state => {
                state.panes = state.panes.filter((pane, i) => {
                    return pane.url === state.activeUrl || i === 0
                })
                return state
            }, () => {
                this.setSessionStrange()
            })
        } else if (e.key === '3') {
            this.setState(state => {
                state.panes = state.panes.filter((pane, i) => {
                    return i === 0
                })
                return state
            }, () => {
                this.props.history.push(this.state.panes[0].url)
            })
        }
    }
    render() {
        const menu = (
            <Menu onClick={this.handleShowAction}>
                <Menu.Item key="0"> 刷新当前选项卡 </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="1" disabled={this.state.panes.length < 2}> 关闭当前选项卡 </Menu.Item>
                <Menu.Item key="2" disabled={this.state.panes.length < 3}>关闭其他选项卡</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3" disabled={this.state.panes.length < 2}>关闭所有选项卡</Menu.Item>
            </Menu>
        );
        return <div className="topMenuComponent">
            <div className="topMenuBlock">
                <div className="left" style={{ width: 'calc( 100% - 90px )' }}>
                    <Tabs
                        hideAdd
                        onChange={this.onChange}
                        activeUrl={this.state.activeUrl}
                        type="editable-card"
                        onEdit={this.onEdit}
                        style={{ marginTop: '16px' }}
                    >
                        {
                            this.state.panes && this.state.panes.map(pane => {
                                return (
                                    <TabPane
                                        tab={
                                            <span>
                                                {
                                                    pane.url === this.state.activeUrl
                                                        ? <Icon type={pane.icon} />
                                                        : <Icon type={pane.icon} />
                                                }
                                                {pane.title}
                                            </span>
                                        }
                                        key={pane.url}
                                        closable={pane.closable}
                                    />
                                )
                            })
                        }
                    </Tabs>
                </div>
                <div className="right">
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button >选项<Icon type="down" /></Button>
                    </Dropdown>
                </div>
            </div>
            <div className="writeBlock" />
        </div>
    }
}
export default withRouter(TopMenu)