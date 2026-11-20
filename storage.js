/**
 * 마이트립(My Trip) - 기기 전용 로컬 저장소 (localStorage)
 *
 * 기획 의도:
 * 청소년이 스스로 질문을 완료하고 마을을 여행하며 '내가 이만큼이나 해냈구나!'라는
 * 성취감을 시각적으로 느끼도록 돕는 공간입니다.
 * 외부 서버나 복잡한 사용자 관리를 배제하고 오직 현재 참여자의 기기에만 안전하게 저장합니다.
 * 질문 답변 내용은 절대 저장하지 않으며 오직 '완료 여부(체크)'만 저장합니다.
 */

window.MY_TRIP_STORAGE = (function() {
  'use strict';

  var STORAGE_KEY = 'mytrip_local_journey_data';

  // 오늘 날짜 (YYYY-MM-DD, KST 기준)
  function getTodayKST() {
    var now = new Date();
    var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    var kst = new Date(utc + (9 * 60 * 60000));
    var y = kst.getFullYear();
    var m = kst.getMonth() + 1;
    var d = kst.getDate();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  }

  // 기본 사용자 데이터
  function getDefaultData() {
    return {
      userName: '여행자',
      season: 'spring', // 기본 봄 (꽃 장식)
      currentVillage: 'me', // 현재 캠핑카가 위치한 마을
      unlockedVillages: ['me'], // 개방된 마을 목록
      completedQuestions: {}, // { 'me_1': true, ... } 오직 완료 체크만 저장
      coins: 100,
      fuel: 100,
      finalQuestionCompleted: false,
      lastLoginDate: getTodayKST(),
      createdAt: new Date().toISOString()
    };
  }

  // 데이터 로드
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        // 날짜가 바뀌었으면 기름 100% 충전 및 출석 보너스
        checkDailyReset(data);
        return data;
      }
    } catch (e) {
      console.error('마이트립 데이터 로드 오류:', e);
    }
    return null;
  }

  // 날짜 변경 시 가벼운 출석 체크
  function checkDailyReset(data) {
    var today = getTodayKST();
    if (data.lastLoginDate !== today) {
      data.lastLoginDate = today;
      data.fuel = 100;
      data.coins = (data.coins || 0) + 20; // 기획서: 출석 보너스 20
      saveData(data);
    }
  }

  // 데이터 저장
  function saveData(data) {
    if (!data) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('마이트립 데이터 저장 오류:', e);
      return false;
    }
  }

  // 초기 설정 저장 (이름 및 계절)
  function initUser(userName, season) {
    var current = loadData() || getDefaultData();
    current.userName = (userName && userName.trim()) || '여행자';
    current.season = season || 'spring';
    saveData(current);
    return current;
  }

  // 질문 완료 토글 및 보상 처리
  function markQuestionComplete(questionId, villageId) {
    var data = loadData() || getDefaultData();
    if (!data.completedQuestions) data.completedQuestions = {};

    var isNewlyCompleted = !data.completedQuestions[questionId];

    if (isNewlyCompleted) {
      data.completedQuestions[questionId] = true;
      // 질문 완수 시 보상: 기름 100% 충전, 50 코인
      data.coins = (data.coins || 0) + (window.MY_TRIP_RULES.rewards.questionCompleteCoins || 50);
      data.fuel = window.MY_TRIP_RULES.rewards.questionCompleteFuel || 100;

      // 마을 완주 및 다음 마을 해금 확인
      var unlockResult = checkVillageUnlock(data, villageId);
      saveData(data);

      return {
        data: data,
        isNewlyCompleted: true,
        newlyUnlockedVillage: unlockResult.newlyUnlockedVillage,
        isAllCompleted: unlockResult.isAllCompleted
      };
    }

    saveData(data);
    return {
      data: data,
      isNewlyCompleted: false,
      newlyUnlockedVillage: null,
      isAllCompleted: false
    };
  }

  // 마을 해금 확인 로직
  function checkVillageUnlock(data, villageId) {
    var questionsData = window.MY_TRIP_QUESTIONS;
    var order = window.MY_TRIP_RULES.villageOrder;
    var currentIdx = order.indexOf(villageId);

    // 해당 마을 질문 목록
    var targetVillage = null;
    for (var i = 0; i < questionsData.villages.length; i++) {
      if (questionsData.villages[i].id === villageId) {
        targetVillage = questionsData.villages[i];
        break;
      }
    }

    var completedCount = 0;
    if (targetVillage) {
      for (var q = 0; q < targetVillage.questions.length; q++) {
        if (data.completedQuestions[targetVillage.questions[q].id]) {
          completedCount++;
        }
      }
    }

    var newlyUnlockedVillage = null;
    // 10개 완주 시 다음 마을 자동 개방
    if (completedCount >= 10 && currentIdx !== -1 && currentIdx < order.length - 1) {
      var nextVillageId = order[currentIdx + 1];
      if (data.unlockedVillages.indexOf(nextVillageId) === -1) {
        data.unlockedVillages.push(nextVillageId);
        newlyUnlockedVillage = nextVillageId;
        data.currentVillage = nextVillageId; // 캠핑카 위치를 다음 마을로 전진
      }
    }

    // 전체 50개 완주 체크
    var totalCompleted = Object.keys(data.completedQuestions).length;
    var isAllCompleted = totalCompleted >= 50;

    return {
      newlyUnlockedVillage: newlyUnlockedVillage,
      isAllCompleted: isAllCompleted
    };
  }

  // 통계 헬퍼 (순수하게 청소년 본인의 성취감 표시용)
  function getProgressSummary(data) {
    if (!data) data = loadData() || getDefaultData();
    var questionsData = window.MY_TRIP_QUESTIONS;
    var totalCompleted = 0;
    var villageProgress = {};

    questionsData.villages.forEach(function(v) {
      var c = 0;
      v.questions.forEach(function(q) {
        if (data.completedQuestions[q.id]) c++;
      });
      totalCompleted += c;
      villageProgress[v.id] = {
        name: v.name,
        completed: c,
        total: v.requiredQuestions,
        percent: Math.min(100, Math.round((c / v.requiredQuestions) * 100)),
        isCompleted: c >= v.requiredQuestions,
        isUnlocked: (data.unlockedVillages || ['me']).indexOf(v.id) !== -1,
        isCurrent: data.currentVillage === v.id
      };
    });

    return {
      totalCompleted: totalCompleted,
      totalQuestions: 50,
      totalPercent: Math.min(100, Math.round((totalCompleted / 50) * 100)),
      villageProgress: villageProgress,
      isAllCompleted: totalCompleted >= 50
    };
  }

  // 여정 초기화 (사용자 본인이 처음부터 다시 시작하고 싶을 때)
  function resetMyJourney() {
    localStorage.removeItem(STORAGE_KEY);
    return getDefaultData();
  }

  return {
    loadData: loadData,
    saveData: saveData,
    initUser: initUser,
    markQuestionComplete: markQuestionComplete,
    getProgressSummary: getProgressSummary,
    resetMyJourney: resetMyJourney,
    getTodayKST: getTodayKST
  };
})();
