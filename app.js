/**
 * 마이트립(My Trip) - 메인 애플리케이션 스크립트
 *
 * 기획 의도:
 * 청소년이 스스로 질문을 완료하고 마을을 여행하며 '내가 이만큼이나 해냈구나!'라는
 * 성취감을 시각적으로 느끼도록 돕는 공간입니다.
 */

(function() {
  'use strict';

  // 현재 앱 상태
  var state = {
    userData: null,
    currentScreen: 'screen-main',
    viewingVillageId: 'me',
    viewingQuestionIndex: 0, // 0 ~ 9
    isViewingFinalQuestion: false
  };

  // DOM 요소 캐시
  var els = {};

  // 초기화 함수
  function init() {
    cacheElements();
    bindEvents();
    checkInitialUser();
  }

  function cacheElements() {
    els.appContainer = document.getElementById('app-container');
    els.headerUserBadge = document.getElementById('header-user-badge');
    els.headerCoinVal = document.getElementById('header-coin-val');
    els.headerFuelVal = document.getElementById('header-fuel-val');
    els.journeyProgressText = document.getElementById('journey-progress-text');
    els.journeyProgressBar = document.getElementById('journey-progress-bar');

    // 화면들
    els.screens = {
      'screen-main': document.getElementById('screen-main'),
      'screen-interior': document.getElementById('screen-interior'),
      'screen-map': document.getElementById('screen-map'),
      'screen-daily-question': document.getElementById('screen-daily-question'),
      'screen-village-questions': document.getElementById('screen-village-questions'),
      'screen-fairy': document.getElementById('screen-fairy')
    };

    // 메인 화면 요소
    els.mainMoaImg = document.getElementById('main-moa-img');
    els.mainMoaBubble = document.getElementById('main-moa-bubble');
    els.mainCheerTitle = document.getElementById('main-cheer-title');
    els.mainCheerDesc = document.getElementById('main-cheer-desc');
    els.btnGoInterior = document.getElementById('btn-go-interior');
    els.btnStartJourney = document.getElementById('btn-start-journey');
    els.btnOpenSettings = document.getElementById('btn-open-settings');
    els.vanDoorHotspot = document.getElementById('van-door-hotspot');
    els.fairyLawnContainer = document.getElementById('fairy-lawn-container');

    // 차량 내부 요소
    els.hotspotJournal = document.getElementById('hotspot-journal');
    els.hotspotMap = document.getElementById('hotspot-map');
    els.btnInteriorToMain = document.getElementById('btn-interior-to-main');
    els.btnInteriorToJournal = document.getElementById('btn-interior-to-journal');
    els.btnInteriorToMap = document.getElementById('btn-interior-to-map');
    els.btnInteriorToFairy = document.getElementById('btn-interior-to-fairy');

    // 지도 화면 요소
    els.btnMapBack = document.getElementById('btn-map-back');
    els.villagesScrollList = document.getElementById('villages-scroll-list');

    // 질문 화면 요소
    els.btnQuestionBack = document.getElementById('btn-question-back');
    els.qVillageBadge = document.getElementById('q-village-badge');
    els.qNumberBadge = document.getElementById('q-number-badge');
    els.qStatusStamp = document.getElementById('q-status-stamp');
    els.qVillageProgressLabel = document.getElementById('q-village-progress-label');
    els.qTextBody = document.getElementById('q-text-body');
    els.btnPrevQuestion = document.getElementById('btn-prev-question');
    els.btnNextQuestion = document.getElementById('btn-next-question');
    els.btnCompleteCheck = document.getElementById('btn-complete-check');
    els.btnViewVillageList = document.getElementById('btn-view-village-list');

    // 마을별 질문 목록 요소
    els.btnVillageListBack = document.getElementById('btn-village-list-back');
    els.villageListTitle = document.getElementById('village-list-title');
    els.villageQuestionsContainer = document.getElementById('village-questions-container');

    // 요정 화면 요소
    els.btnFairyBack = document.getElementById('btn-fairy-back');
    els.fairyAvatarImg = document.getElementById('fairy-avatar-img');
    els.fairyTitleName = document.getElementById('fairy-title-name');
    els.fairyDescText = document.getElementById('fairy-desc-text');
    els.fairySeasonBadge = document.getElementById('fairy-season-badge');
    els.fairyStageBadge = document.getElementById('fairy-stage-badge');

    // 모달 & 토스트
    els.modalUserSetup = document.getElementById('modal-user-setup');
    els.customUserIdInput = document.getElementById('custom-user-id');
    els.seasonSelect = document.getElementById('season-select');
    els.btnSaveUserSetup = document.getElementById('btn-save-user-setup');
    els.modalVillageUnlock = document.getElementById('modal-village-unlock');
    els.celebrateVillageTitle = document.getElementById('celebrate-village-title');
    els.celebrateVillageDesc = document.getElementById('celebrate-village-desc');
    els.btnConfirmUnlock = document.getElementById('btn-confirm-unlock');
    els.toast = document.getElementById('toast-notification');
  }

  // 초기 사용자 데이터 확인
  function checkInitialUser() {
    var data = window.MY_TRIP_STORAGE.loadData();
    if (data) {
      state.userData = data;
      onDataLoaded();
      return;
    }
    // 데이터가 없으면 환영 설정 모달 표시
    openUserSetupModal();
  }

  function onDataLoaded() {
    syncGlobalHeader();
    renderMainScreen();
  }

  // 화면 전환 함수
  function showScreen(screenId) {
    if (!els.screens[screenId]) return;
    Object.keys(els.screens).forEach(function(key) {
      els.screens[key].classList.remove('active');
    });
    els.screens[screenId].classList.add('active');
    state.currentScreen = screenId;

    if (screenId === 'screen-main') renderMainScreen();
    else if (screenId === 'screen-map') renderMapScreen();
    else if (screenId === 'screen-daily-question') renderQuestionScreen();
    else if (screenId === 'screen-village-questions') renderVillageQuestionsScreen();
    else if (screenId === 'screen-fairy') renderFairyScreen();

    syncGlobalHeader();
  }

  // 상단 글로벌 헤더 & 진행률 바 동기화
  function syncGlobalHeader() {
    if (!state.userData) return;
    var seasonName = (window.MY_TRIP_FAIRY.seasons[state.userData.season] || {}).name || '봄';
    els.headerUserBadge.textContent = '🌱 ' + state.userData.userName + ' (' + seasonName + ')';
    els.headerCoinVal.textContent = state.userData.coins || 0;
    els.headerFuelVal.textContent = (state.userData.fuel || 0) + '%';

    // 전체 여정 진행률 계산
    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    els.journeyProgressText.textContent = summary.totalCompleted + ' / ' + summary.totalQuestions + '개 완료 (' + summary.totalPercent + '%)';
    els.journeyProgressBar.style.width = summary.totalPercent + '%';
  }

  // 1. 메인 화면 렌더링
  function renderMainScreen() {
    if (!state.userData) return;
    var fairyStatus = getMoaStatus();
    els.mainMoaImg.src = fairyStatus.image;
    els.mainMoaImg.alt = fairyStatus.name;
    els.mainMoaBubble.textContent = fairyStatus.name;

    // 성취감 응원 카드 갱신
    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    var curVillageMeta = window.MY_TRIP_RULES.villageMeta[state.userData.currentVillage] || {};
    var curVillageProg = summary.villageProgress[state.userData.currentVillage] || { completed: 0, total: 10 };

    if (summary.totalCompleted === 0) {
      els.mainCheerTitle.textContent = '나를 찾아가는 첫 번째 발걸음!';
      els.mainCheerDesc.textContent = '캠핑카 문을 열고 오늘의 질문을 확인해 봐요.';
    } else if (summary.isAllCompleted) {
      els.mainCheerTitle.textContent = '🎉 모든 여정을 멋지게 완주했어요!';
      els.mainCheerDesc.textContent = '모아와 함께한 특별한 성장의 기억을 오래도록 간직해요.';
    } else {
      els.mainCheerTitle.textContent = '🚐 현재 [' + curVillageMeta.name + ']을 탐색 중!';
      els.mainCheerDesc.textContent = '10개 중 ' + curVillageProg.completed + '개 완료! 벌써 이만큼이나 해냈어요 👏';
    }
  }

  // 요정 모아 상태 헬퍼
  function getMoaStatus() {
    if (!state.userData) return { image: 'assets/moa/egg_spring.png', name: '요정 모아의 알' };
    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    var meCompletedCount = summary.villageProgress.me ? summary.villageProgress.me.completed : 0;

    return window.MY_TRIP_FAIRY.getCurrentMoaStatus({
      season: state.userData.season,
      currentVillage: state.userData.currentVillage,
      meCompletedCount: meCompletedCount,
      isAllCompleted: summary.isAllCompleted
    });
  }

  // 2. 여행 지도 화면 렌더링 (캠핑카 현재 위치 & 완주 마을 표시)
  function renderMapScreen() {
    if (!state.userData) return;
    var questionsData = window.MY_TRIP_QUESTIONS;
    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    var unlocked = state.userData.unlockedVillages || ['me'];
    var html = '';

    questionsData.villages.forEach(function(v) {
      var isUnlocked = unlocked.indexOf(v.id) !== -1;
      var isCurrent = state.userData.currentVillage === v.id;
      var vp = summary.villageProgress[v.id] || { completed: 0, total: 10, percent: 0, isCompleted: false };

      var cardClass = 'village-status-card';
      if (!isUnlocked) cardClass += ' locked';
      if (isCurrent) cardClass += ' current';
      if (vp.isCompleted) cardClass += ' completed';

      var meta = window.MY_TRIP_RULES.villageMeta[v.id] || {};

      html += '<div class="' + cardClass + '" data-village-id="' + v.id + '">';
      
      // 현재 캠핑카 위치 배지
      if (isCurrent && !vp.isCompleted) {
        html += '<div class="van-current-tag">🚐 내 캠핑카 위치</div>';
      } else if (vp.isCompleted) {
        html += '<div class="village-cleared-tag">🏆 완주 완료!</div>';
      }

      html += '  <div class="village-info-left">';
      html += '    <div class="village-num-badge" style="background-color: ' + (meta.color || '#F39C12') + '">' + v.number + '</div>';
      html += '    <div class="village-text">';
      html += '      <h4>' + v.name + (vp.isCompleted ? ' ✅' : (isUnlocked ? '' : ' 🔒')) + '</h4>';
      html += '      <span class="sub-desc">' + v.theme + ' (' + v.prop + ')</span>';
      html += '    </div>';
      html += '  </div>';

      html += '  <div class="village-progress-right">';
      html += '    <strong style="color: ' + (vp.isCompleted ? '#27AE60' : '#4A3E31') + '">' + vp.completed + ' / ' + vp.total + ' (' + vp.percent + '%)</strong>';
      html += '    <div class="prog-bar-bg"><div class="prog-bar-fill" style="width: ' + vp.percent + '%"></div></div>';
      html += '  </div>';

      html += '</div>';
    });

    els.villagesScrollList.innerHTML = html;

    // 마을 클릭 이벤트
    var cards = els.villagesScrollList.querySelectorAll('.village-status-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function() {
        var vid = card.getAttribute('data-village-id');
        if (unlocked.indexOf(vid) === -1) {
          showToast(window.MY_TRIP_RULES.messages.lockedVillage);
        } else {
          state.viewingVillageId = vid;
          state.viewingQuestionIndex = 0;
          state.isViewingFinalQuestion = false;
          showScreen('screen-village-questions');
        }
      });
    });
  }

  // 3. 오늘의 질문 화면 렌더링 (도장 및 완료 상태)
  function renderQuestionScreen() {
    if (!state.userData) return;

    if (state.isViewingFinalQuestion) {
      renderFinalQuestion();
      return;
    }

    var questionsData = window.MY_TRIP_QUESTIONS;
    var village = null;
    for (var i = 0; i < questionsData.villages.length; i++) {
      if (questionsData.villages[i].id === state.viewingVillageId) {
        village = questionsData.villages[i];
        break;
      }
    }
    if (!village) village = questionsData.villages[0];

    var qIndex = state.viewingQuestionIndex;
    if (qIndex < 0) qIndex = 0;
    if (qIndex >= village.questions.length) qIndex = village.questions.length - 1;
    state.viewingQuestionIndex = qIndex;

    var currentQ = village.questions[qIndex];
    var isDone = !!state.userData.completedQuestions[currentQ.id];

    // 이 마을에서 완료한 개수 계산
    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    var vp = summary.villageProgress[village.id] || { completed: 0, total: 10 };

    els.qVillageBadge.textContent = village.name;
    els.qNumberBadge.textContent = '질문 ' + (qIndex + 1) + ' / ' + village.questions.length;
    els.qVillageProgressLabel.textContent = '🌱 ' + village.name + ' 10개 중 ' + vp.completed + '개 완료!';
    els.qTextBody.textContent = currentQ.question;

    if (isDone) {
      els.qStatusStamp.classList.add('visible');
      els.btnCompleteCheck.innerHTML = '✔ 작성 완료됨 (다시 확인)';
      els.btnCompleteCheck.classList.add('completed');
    } else {
      els.qStatusStamp.classList.remove('visible');
      els.btnCompleteCheck.innerHTML = '💮 질문 완료 도장 찍기 (+50코인 / 기름 100L)';
      els.btnCompleteCheck.classList.remove('completed');
    }

    els.btnPrevQuestion.disabled = (qIndex === 0);
    els.btnNextQuestion.disabled = (qIndex === village.questions.length - 1);
  }

  function renderFinalQuestion() {
    var finalQ = window.MY_TRIP_QUESTIONS.finalQuestion;
    var isDone = !!state.userData.finalQuestionCompleted;

    els.qVillageBadge.textContent = '⭐ 전체 여정 마무리';
    els.qNumberBadge.textContent = '최종 질문';
    els.qVillageProgressLabel.textContent = '✨ 모든 여정을 마치고 나를 돌아보는 시간';
    els.qTextBody.textContent = finalQ.question;

    if (isDone) {
      els.qStatusStamp.classList.add('visible');
      els.btnCompleteCheck.innerHTML = '🏆 여정 완주 도장 완료!';
      els.btnCompleteCheck.classList.add('completed');
    } else {
      els.qStatusStamp.classList.remove('visible');
      els.btnCompleteCheck.innerHTML = '🎉 최종 마무리 도장 찍기';
      els.btnCompleteCheck.classList.remove('completed');
    }

    els.btnPrevQuestion.disabled = true;
    els.btnNextQuestion.disabled = true;
  }

  // 질문 완료 도장 찍기 클릭 처리
  function handleCompleteQuestion() {
    if (!state.userData) return;

    if (state.isViewingFinalQuestion) {
      state.userData.finalQuestionCompleted = true;
      window.MY_TRIP_STORAGE.saveData(state.userData);
      showToast("모든 여정을 완주하셨습니다! 당신의 앞날을 모아가 힘차게 응원해요!");
      renderQuestionScreen();
      syncGlobalHeader();
      return;
    }

    var questionsData = window.MY_TRIP_QUESTIONS;
    var village = null;
    for (var i = 0; i < questionsData.villages.length; i++) {
      if (questionsData.villages[i].id === state.viewingVillageId) {
        village = questionsData.villages[i];
        break;
      }
    }
    if (!village) return;

    var currentQ = village.questions[state.viewingQuestionIndex];
    var res = window.MY_TRIP_STORAGE.markQuestionComplete(currentQ.id, village.id);

    if (res && res.isNewlyCompleted) {
      state.userData = res.data;
      showToast("💮 참 잘했어요! 질문을 완수하고 50코인을 얻었습니다!");

      // 1. 다음 마을이 새롭게 열렸을 때 축하 모달 표시!
      if (res.newlyUnlockedVillage) {
        var nextMeta = window.MY_TRIP_RULES.villageMeta[res.newlyUnlockedVillage] || {};
        showUnlockCelebrateModal(village.name, nextMeta.name);
      }
      // 2. 나 마을 10개 완주로 모아가 태어났을 때 축하 메시지
      else if (village.id === 'me') {
        var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
        if (summary.villageProgress.me && summary.villageProgress.me.completed === 10) {
          setTimeout(function() {
            showToast(window.MY_TRIP_RULES.messages.fairyHatched);
          }, 1400);
        }
      }
    } else {
      showToast("이미 완료 도장을 찍은 질문입니다. 언제든 다시 돌아볼 수 있어요!");
    }

    renderQuestionScreen();
    syncGlobalHeader();
  }

  // 다음 마을 해금 축하 모달 띄우기
  function showUnlockCelebrateModal(prevVillageName, newVillageName) {
    els.celebrateVillageTitle.textContent = '🎉 ' + newVillageName + '이 열렸어요!';
    els.celebrateVillageDesc.innerHTML = '<strong>' + prevVillageName + '</strong>의 10개 질문을 모두 멋지게 완주했습니다!<br>노란 캠핑카를 타고 <strong>' + newVillageName + '</strong>로 여행을 떠나요! 🚐';
    els.modalVillageUnlock.classList.add('active');
  }

  // 4. 마을별 질문 목록 화면 렌더링
  function renderVillageQuestionsScreen() {
    if (!state.userData) return;
    var questionsData = window.MY_TRIP_QUESTIONS;
    var village = null;
    for (var i = 0; i < questionsData.villages.length; i++) {
      if (questionsData.villages[i].id === state.viewingVillageId) {
        village = questionsData.villages[i];
        break;
      }
    }
    if (!village) return;

    var summary = window.MY_TRIP_STORAGE.getProgressSummary(state.userData);
    var vp = summary.villageProgress[village.id] || { completed: 0, total: 10 };

    els.villageListTitle.textContent = village.name + ' (' + vp.completed + ' / ' + vp.total + '개 완료)';

    var html = '';
    village.questions.forEach(function(q, idx) {
      var isDone = !!state.userData.completedQuestions[q.id];
      html += '<div class="village-status-card" style="margin-bottom: 8px;" data-q-index="' + idx + '">';
      html += '  <div class="village-info-left">';
      html += '    <div class="village-num-badge" style="background: ' + (isDone ? '#2ECC71' : '#F39C12') + '">' + (isDone ? '✔' : (idx + 1)) + '</div>';
      html += '    <div class="village-text" style="max-width: 280px;">';
      html += '      <h4 style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + q.question + '</h4>';
      html += '      <span class="sub-desc">' + (isDone ? '💮 작성 완료 도장 찍음' : '아직 작성 전') + '</span>';
      html += '    </div>';
      html += '  </div>';
      html += '  <button class="btn-sub-action" style="padding: 6px 12px; font-size: 12px;">보기</button>';
      html += '</div>';
    });

    els.villageQuestionsContainer.innerHTML = html;

    var rows = els.villageQuestionsContainer.querySelectorAll('.village-status-card');
    rows.forEach(function(row) {
      row.addEventListener('click', function() {
        var idx = parseInt(row.getAttribute('data-q-index'), 10);
        state.viewingQuestionIndex = idx;
        state.isViewingFinalQuestion = false;
        showScreen('screen-daily-question');
      });
    });
  }

  // 5. 요정 모아 화면 렌더링
  function renderFairyScreen() {
    if (!state.userData) return;
    var fairyStatus = getMoaStatus();
    els.fairyAvatarImg.src = fairyStatus.image;
    els.fairyTitleName.textContent = fairyStatus.name;
    els.fairyDescText.textContent = fairyStatus.desc;
    els.fairySeasonBadge.textContent = '계절: ' + fairyStatus.season.name + ' (' + fairyStatus.season.deco + ')';
    els.fairyStageBadge.textContent = fairyStatus.stageType === 'me_growth' ? '성장도: ' + fairyStatus.percent + '%' : '성장 완료';
  }

  // 여행자 프로필 설정 모달
  function openUserSetupModal() {
    if (state.userData) {
      els.customUserIdInput.value = state.userData.userName || '';
      els.seasonSelect.value = state.userData.season || 'spring';
    }
    els.modalUserSetup.classList.add('active');
  }

  function closeUserSetupModal() {
    els.modalUserSetup.classList.remove('active');
  }

  function saveUserSetup() {
    var name = els.customUserIdInput.value.trim() || '여행자';
    var season = els.seasonSelect.value || 'spring';

    state.userData = window.MY_TRIP_STORAGE.initUser(name, season);
    closeUserSetupModal();
    onDataLoaded();
    showToast("반가워요 " + name + "님! 마이트립 여행을 시작합니다 🚐");
  }

  // 토스트 알림
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(function() {
      els.toast.classList.remove('show');
    }, 2800);
  }

  // 이벤트 바인딩
  function bindEvents() {
    els.headerUserBadge.addEventListener('click', openUserSetupModal);
    els.btnOpenSettings.addEventListener('click', openUserSetupModal);

    // 메인 화면
    els.vanDoorHotspot.addEventListener('click', function() { showScreen('screen-interior'); });
    els.btnGoInterior.addEventListener('click', function() { showScreen('screen-interior'); });
    els.btnStartJourney.addEventListener('click', function() { showScreen('screen-map'); });
    els.fairyLawnContainer.addEventListener('click', function() { showScreen('screen-fairy'); });

    // 차량 내부 화면
    els.hotspotJournal.addEventListener('click', function() {
      state.viewingVillageId = state.userData ? state.userData.currentVillage : 'me';
      state.viewingQuestionIndex = 0;
      state.isViewingFinalQuestion = false;
      showScreen('screen-daily-question');
    });
    els.btnInteriorToJournal.addEventListener('click', function() {
      state.viewingVillageId = state.userData ? state.userData.currentVillage : 'me';
      state.viewingQuestionIndex = 0;
      state.isViewingFinalQuestion = false;
      showScreen('screen-daily-question');
    });
    els.hotspotMap.addEventListener('click', function() { showScreen('screen-map'); });
    els.btnInteriorToMap.addEventListener('click', function() { showScreen('screen-map'); });
    els.btnInteriorToMain.addEventListener('click', function() { showScreen('screen-main'); });
    els.btnInteriorToFairy.addEventListener('click', function() { showScreen('screen-fairy'); });

    // 지도 화면
    els.btnMapBack.addEventListener('click', function() { showScreen('screen-interior'); });

    // 질문 화면
    els.btnQuestionBack.addEventListener('click', function() { showScreen('screen-interior'); });
    els.btnPrevQuestion.addEventListener('click', function() {
      if (state.viewingQuestionIndex > 0) {
        state.viewingQuestionIndex--;
        renderQuestionScreen();
      }
    });
    els.btnNextQuestion.addEventListener('click', function() {
      var questionsData = window.MY_TRIP_QUESTIONS;
      var village = null;
      for (var i = 0; i < questionsData.villages.length; i++) {
        if (questionsData.villages[i].id === state.viewingVillageId) {
          village = questionsData.villages[i];
          break;
        }
      }
      if (village && state.viewingQuestionIndex < village.questions.length - 1) {
        state.viewingQuestionIndex++;
        renderQuestionScreen();
      }
    });
    els.btnCompleteCheck.addEventListener('click', handleCompleteQuestion);
    els.btnViewVillageList.addEventListener('click', function() {
      showScreen('screen-village-questions');
    });

    // 마을 질문 목록
    els.btnVillageListBack.addEventListener('click', function() { showScreen('screen-map'); });

    // 요정 화면
    els.btnFairyBack.addEventListener('click', function() { showScreen('screen-interior'); });

    // 모달 버튼
    els.btnSaveUserSetup.addEventListener('click', saveUserSetup);
    els.btnConfirmUnlock.addEventListener('click', function() {
      els.modalVillageUnlock.classList.remove('active');
      showScreen('screen-map');
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.MY_TRIP_APP = {
    showScreen: showScreen,
    openUserSetupModal: openUserSetupModal,
    showToast: showToast
  };

})();
