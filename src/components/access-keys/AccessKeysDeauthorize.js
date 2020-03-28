import React from 'react'
import { Translate } from 'react-localize-redux'

import MainImage from '../common/MainImage'
import Balance from '../common/Balance'
import AccessKeysDeauthorizeConfirm from './AccessKeysDeauthorizeConfirm'
import FormButton from '../common/FormButton'

import { List } from 'semantic-ui-react'

const AccessKeysDeauthorize = ({
    showSubData, 
    handleDeauthorize,
    accountId,
    confirm,
    confirmStatus,
    handleConfirm,
    handleConfirmSubmit,
    handleChange,
    handleConfirmClear,
    buttonLoader
}) => (
    // TODO: Simplify layout as seems too much unnecessary nesting, while can use simple html tags, etc
    <List>
        <List.Item>
            <List horizontal className='title'>
                {false &&
                    <List.Item className='image'>
                        <MainImage
                            src={showSubData.image}
                            size='big'
                        />
                    </List.Item>
                }
                <List.Item className='publickey'>
                    {showSubData.access_key.permission.FunctionCall
                        ? <React.Fragment>
                            <List.Header as='h2'>
                                {showSubData.access_key.permission.FunctionCall.receiver_id}
                            </List.Header>
                            <List.Item as='h5' className='color-blue'>
                                <span className='color-black'><Translate id='amount' />: </span>
                                <Balance amount={showSubData.access_key.permission.FunctionCall.allowance} />
                            </List.Item>
                        </React.Fragment>
                        : null
                    }
                    <List.Item className='color-blue'>
                        {showSubData.public_key}
                    </List.Item>
                </List.Item>
            </List>
        </List.Item>
        <List.Item className='remove-connection'>
            {confirm ? (
                <AccessKeysDeauthorizeConfirm 
                    handleConfirmSubmit={handleConfirmSubmit}
                    handleChange={handleChange}
                    accountId={accountId}
                    confirmStatus={confirmStatus}
                    handleConfirmClear={handleConfirmClear}
                    buttonLoader={buttonLoader}
                />
            ) : (
                <FormButton
                    className='deauthorize'
                    color='red'
                    sending={buttonLoader}
                    onClick={showSubData.access_key.permission === 'FullAccess' ? handleConfirm : handleDeauthorize}
                >
                    <Translate id='button.deauthorize' />
                </FormButton>
            )}
        </List.Item>
        <List.Item className='authorized-transactions'>
            <List.Item
                as='h6'
                className='authorized-transactions-title border-top'
            >
                <Translate id='fullAccessKeys.authorizedTo' />
            </List.Item>
            <List.Item className='authorized-transactions-row color-black'>
                <Translate id='fullAccessKeys.viewYourAccountName' />
            </List.Item>
            {showSubData.access_key.permission === 'FullAccess'
                ? <List.Item className='authorized-transactions-row color-black'>
                    <Translate id='fullAccessKeys.submitAnyTransaction' />
                </List.Item>
                : null
            }
            {showSubData.access_key.permission.FunctionCall
                ? <List.Item className='authorized-transactions-row color-black'>
                    <Translate id='fullAccessKeys.useContract' data={{ receiverId: showSubData.access_key.permission.FunctionCall.receiver_id }} />
                </List.Item>
                : null
            }
        </List.Item>
        {false && (
            <List.Item className='recent-transactions'>
                <List.Item
                    as='h6'
                    className='recent-transactions-title border-top'
                >
                    RECENT TRANSACTIONS
                </List.Item>
                <List.Item className='recent-transactions-row border-top'>
                    <List.Header>
                        Another thing here
                    </List.Header>
                    <List.Item>3h ago</List.Item>
                </List.Item>
                <List.Item className='recent-transactions-row border-top'>
                    <List.Header>
                        Another Thing Happened
                    </List.Header>
                    <List.Item>3d ago</List.Item>
                </List.Item>
                <List.Item className='recent-transactions-row border-top'>
                    <List.Header>
                        In-app purchase: 20 Ⓝ
                    </List.Header>
                    <List.Item>1w ago</List.Item>
                </List.Item>
                <List.Item className='recent-transactions-row border-top'>
                    <List.Header>Staked: 10 Ⓝ</List.Header>
                    <List.Item>2w ago</List.Item>
                </List.Item>
                <List.Item className='recent-transactions-row border-top'>
                    <List.Header>Authorized</List.Header>
                    <List.Item>2w ago</List.Item>
                </List.Item>
            </List.Item>
        )}
    </List>
)

export default AccessKeysDeauthorize
