/**
 * Component - Login Component
 *
 * @file Login.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0 */

import {hashHistory} from 'react-router';
import React, {Component, PropTypes} from 'react';

import styles from './Login.css';
import {REGION_BJ} from '../utils/Region';
import GlobalConfig from '../../main/ConfigManager';

const VALID_AUTH = 'VALID_AUTH';
const INVALID_PIN = 'INVALID_PIN';
const INVALID_AK_SK = 'INVALID_AK_SK';
const credentials = Object.assign({}, GlobalConfig.get('credentials'));

export default class Login extends Component {
    static propTypes = {
        auth: PropTypes.shape({
            isLoading: PropTypes.bool.isRequired,
            isAuth: PropTypes.bool.isRequired,
            error: PropTypes.string,
            ak: PropTypes.string,
            sk: PropTypes.string,
            pin: PropTypes.string
        }),
        login: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args);

        this.state = {innerErrorType: VALID_AUTH};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuth) {
            hashHistory.push(`/region/${REGION_BJ}`);
        }
    }

    getLoginRender() {
        const {isLoading = false} = this.props.auth;
        if (isLoading) {
            return <i className={`${styles.loading} fa fa-spinner fa-pulse fa-fw`} />;
        }
        return <input type="submit" className={styles.loginBtn} value="登录" />;
    }

    getLoginError() {
        const {ak, sk, isAuth, error} = this.props.auth;
        if (ak && sk && isAuth === false && error) {
            return <span className={styles.error}>登录失败:{error}</span>;
        }
    }

    getValidError() {
        const {innerErrorType} = this.state;

        if (innerErrorType === VALID_AUTH) {
            return '';
        } else if (innerErrorType === INVALID_AK_SK) {
            return (
                <span className={styles.error}>请输入AK、SK!</span>
            );
        } else if (innerErrorType === INVALID_PIN) {
            return (
                <span className={`${styles.error} ${styles.pinInValid}`} onClick={() => this.forgotPin()} >
                    PIN码验证失败! 使用AK/SK验证?
                </span>
            );
        }
    }

    handleSubmit(evt) {
        evt.preventDefault();

        const {login, auth} = this.props;
        const pin = this.refs.pin.value.trim();
        if (auth.isAuth && auth.pin) {
            if (pin === auth.pin) {
                return hashHistory.push(`/region/${REGION_BJ}`);
            }
            return this.setState({innerErrorType: INVALID_PIN});
        }

        const ak = this.refs.ak.value.trim();
        const sk = this.refs.sk.value.trim();
        if (ak && sk) {
            return login(ak, sk, pin);
        }

        this.setState({innerErrorType: INVALID_AK_SK});
    }

    forgotPin() {
        const {logout} = this.props;
        this.refs.pin.value = '';
        this.setState({innerErrorType: VALID_AUTH});
        logout();
    }

    render() {
        const {pin, isAuth} = this.props.auth;

        return (
            <div className={styles.container}>
                <form className={styles.login} onSubmit={evt => this.handleSubmit(evt)}>
                    <h1>百度开放云</h1>
                    {
                        (!isAuth || !pin)
                        && <div>
                            <div className={styles.ak}>
                                <input
                                  ref="ak"
                                  type="text"
                                  placeholder="请输入AK"
                                  defaultValue={credentials.ak}
                                />
                            </div>
                            <div className={styles.sk}>
                                <input
                                  ref="sk"
                                  type="text"
                                  placeholder="请输入SK"
                                  defaultValue={credentials.sk}
                                />
                            </div>
                        </div>
                    }
                    <div className={styles.pin}>
                        <input type="text" placeholder="输入PIN码" ref="pin" />
                        {this.getLoginRender()}
                    </div>
                    {this.getLoginError()}
                    {this.getValidError()}
                </form>
            </div>
        );
    }
}
