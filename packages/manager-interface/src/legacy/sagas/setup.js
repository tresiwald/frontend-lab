import { takeLatest, call, put, take, select } from 'redux-saga/effects';
import slugify from 'slugify';

import {
  setupFund,
  signTermsAndConditions,
  signCompetitionTermsAndConditions,
} from '@melonproject/melon.js';
import { actions as modalActions } from '../actions/modal';

import { types, actions } from '../actions/fund';
import { actions as appActions, types as appTypes } from '../actions/app';
import {
  actions as rankingActions,
  types as rankingTypes,
} from '../actions/ranking';
import {
  types as routeTypes,
  actions as routeActions,
} from '../actions/routes';
import signer from './signer';

function* sign() {
  function* transaction(environment) {
    const signature = yield call(signTermsAndConditions, environment);
    yield put(actions.signSucceeded(signature));
    yield put(modalActions.close());
  }
  yield call(
    signer,
    `Please enter your password below to sign the terms and conditions:`,
    transaction,
    actions.signFailed,
  );
}

function* signCompetition() {
  function* transaction(environment) {
    const competitionSignature = yield call(
      signCompetitionTermsAndConditions,
      environment,
    );
    yield put(actions.signCompetitionSucceeded(competitionSignature));
    yield put(modalActions.close());
  }

  yield call(
    signer,
    `Please enter your password below to sign the competition terms and conditions:`,
    transaction,
    actions.signCompetitionFailed,
  );
}

function* createFund({ name, OasisDex, ZeroEx }) {
  const rankingLoaded = yield select(
    state => state.ranking.rankingList.length > 0,
  );

  if (!rankingLoaded) {
    yield put(rankingActions.getRanking());
    yield take(rankingTypes.GET_RANKING_SUCCEEDED);
  }

  const ranking = yield select(state => state.ranking.rankingList);

  if (ranking.find(fund => slugify(fund.name) === slugify(name))) {
    yield put(modalActions.error('Fund with similar name already registered'));
    return;
  }
  let exchangeNames = [];
  if (OasisDex) exchangeNames.push('MatchingMarket');
  if (ZeroEx) exchangeNames.push('ZeroExExchange');
  function* transaction(environment) {
    const signature = yield select(state => state.fund.signature);
    const fund = yield call(setupFund, environment, {
      name,
      signature,
      exchangeNames,
    });
    yield put(
      actions.setupSucceeded({ ...fund, owner: environment.account.address }),
    );
    yield put(appActions.setUsersFund(fund.address));
    yield put(routeActions.setup());
    yield put(modalActions.close());
    yield put(actions.infoRequested(fund.address));
  }

  yield call(
    signer,
    `Please enter your password below to setup your fund with the name ${name} and to sign our terms and conditions:`,
    transaction,
    actions.setupFailed,
  );
}

function* loadFundOnSetup() {
  const usersFundChecked = yield select(state => state.app.usersFundChecked);
  if (!usersFundChecked) yield take(appTypes.SET_USERS_FUND);

  const hasAccount = yield select(state => !!state.ethereum.account);
  const usersFund = yield select(state => state.app.usersFund);

  if (!hasAccount) {
    yield put(routeActions.account());
  } else if (usersFund) {
    yield put(actions.infoRequested(usersFund));
  }
}

function* setup() {
  yield takeLatest(types.SIGN_REQUESTED, sign);
  yield takeLatest(types.SIGN_COMPETITION_REQUESTED, signCompetition);
  yield takeLatest(types.SETUP_REQUESTED, createFund);
  yield takeLatest(routeTypes.SETUP, loadFundOnSetup);
}

export default setup;
