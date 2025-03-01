import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Translate } from 'react-localize-redux';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useImmerReducer } from 'use-immer';

import { NETWORK_ID } from '../../config';
import IconSecurityLock from '../../images/wallet-migration/IconSecurityLock';
import { switchAccount } from '../../redux/actions/account';
import { selectAccountId } from '../../redux/slices/account';
import WalletClass, { wallet } from '../../utils/wallet';
import AccountListImport from '../accounts/AccountListImport';
import { IMPORT_STATUS } from '../accounts/batch_import_accounts';
import sequentialAccountImportReducer, { ACTIONS } from '../accounts/batch_import_accounts/sequentialAccountImportReducer';
import FormButton from '../common/FormButton';
import LoadingDots from '../common/loader/LoadingDots';
import Modal from '../common/modal/Modal';
import { WALLET_MIGRATION_VIEWS } from './WalletMigration';


const Container = styled.div`
    padding: 15px 0;
    text-align: center;
    margin: 0 auto;

    @media (max-width: 360px) {
        padding: 0;
    }

    @media (min-width: 500px) {
        padding: 48px 28px 12px;
    }

    .accountsTitle {
        text-align: left;
        font-size: 12px;
        padding-top: 72px;
        padding-bottom: 6px;
    }

    .title{
        font-weight: 800;
        font-size: 20px;
        margin-top: 40px;
    }
`;

const ButtonsContainer = styled.div`
    text-align: center;
    width: 100% !important;
    display: flex;
`;

const StyledButton = styled(FormButton)`
    width: calc((100% - 16px) / 2);
    margin: 48px 0 0 !important;

    &:last-child{
        margin-left: 16px !important;
    }
`;


const Disable2FAModal = ({ handleSetActiveView, onClose }) => {
    const [state, localDispatch] = useImmerReducer(sequentialAccountImportReducer, {
        accounts: []
    });
    const [loadingMultisigAccounts, setLoadingMultisigAccounts] = useState(true);
    const initialAccountIdOnStart = useSelector(selectAccountId);
    const initialAccountId = useRef(initialAccountIdOnStart);
    const dispatch = useDispatch();

    useEffect(() => {
        const update2faAccounts = async () => {
            const accounts = await wallet.keyStore.getAccounts(NETWORK_ID);
            const getAccountWithAccessKeysAndType = async (accountId) => {
                const keyType = await wallet.getAccountKeyType(accountId);
                return { accountId, keyType };
            };
            const accountsKeyTypes = await Promise.all(
                accounts.map(getAccountWithAccessKeysAndType)
            );
            localDispatch({
                type: ACTIONS.ADD_ACCOUNTS,
                accounts: accountsKeyTypes.reduce(((acc, { accountId, keyType }) => keyType === WalletClass.KEY_TYPES.MULTISIG ? acc.concat({ accountId, status: null }) : acc), [])
            });
            setLoadingMultisigAccounts(false);
        };
        setLoadingMultisigAccounts(true);
        update2faAccounts();
    }, []);

    const failed = useMemo(() => state.accounts.some((account) => account.status === IMPORT_STATUS.FAILED), [state.accounts]);
    const currentAccount = useMemo(() => !failed && state.accounts.find((account) => account.status === IMPORT_STATUS.PENDING), [failed, state.accounts]);
    const batchDisableNotStarted = useMemo(() => state.accounts.every((account) => account.status === null), [state.accounts]);
    const completedWithSuccess = useMemo(() => !loadingMultisigAccounts && state.accounts.every((account) => account.status === IMPORT_STATUS.SUCCESS), [state.accounts, loadingMultisigAccounts]);

    useEffect(() => {
        if (batchDisableNotStarted) {
            initialAccountId.current = initialAccountIdOnStart;
        }
    },[initialAccountIdOnStart, batchDisableNotStarted]);

    useEffect(() => {
        const disable2faForCurrentAccount = async () => {
            try {
                await dispatch(switchAccount({accountId: currentAccount.accountId}));
                const account = await wallet.getAccount(currentAccount.accountId);
                await account.disableMultisig();
                localDispatch({ type: ACTIONS.SET_CURRENT_DONE });
            } catch (e) {
                localDispatch({ type: ACTIONS.SET_CURRENT_FAILED_AND_END_PROCESS });
            } finally {
                await dispatch(switchAccount({accountId: initialAccountId.current}));
            }
        };
        if (currentAccount) {
            disable2faForCurrentAccount();
        }
    }, [currentAccount]);

    useEffect(() => {
        if (completedWithSuccess) {
            handleSetActiveView(WALLET_MIGRATION_VIEWS.SELECT_DESTINATION_WALLET);
        }
    }, [completedWithSuccess]);

    return (
        <Modal
            modalClass="slim"
            id='migration-modal'
            isOpen={true}
            disableClose={true}
            modalSize='md'
            style={{ maxWidth: '435px' }}
        >
            <Container>
                {loadingMultisigAccounts ? <LoadingDots /> :
                    (
                        <>
                            <IconSecurityLock />
                            <h4 className='title'><Translate id='walletMigration.disable2fa.title' /></h4>
                            <p><Translate id='walletMigration.disable2fa.desc' /></p>
                            <div className="accountsTitle">
                                <Translate id='importAccountWithLink.accountsFound' data={{ count: state.accounts.length }} />
                            </div>
                            <AccountListImport accounts={state.accounts} />
                            <ButtonsContainer>
                                <StyledButton className="gray-blue" onClick={onClose} disabled={!batchDisableNotStarted && !failed}>
                                    <Translate id='button.cancel' />
                                </StyledButton>
                                <StyledButton onClick={() =>
                                    localDispatch({ type: failed ? ACTIONS.RESTART_PROCESS : ACTIONS.BEGIN_IMPORT })
                                } disabled={!failed && !batchDisableNotStarted}>
                                    <Translate id={failed ? 'button.retry' : 'button.continue'} />
                                </StyledButton>
                            </ButtonsContainer>
                        </>
                    )
                }
            </Container>
        </Modal>
    );
};

export default Disable2FAModal;
