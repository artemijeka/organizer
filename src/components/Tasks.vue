<template>
  <ul class="tasks__list mt1 fs1-2">
    <li
      v-for="(tsk, taskID) in tasks.state.data"
      class="tasks__item mb0-5 cp"
      :class="[(tasks.state.curTask.id === taskID) ? '--selected' : '']"
      :key="taskID">



      <button class="tasks__item-btn tasks__item-start" :class="(tasks.state.curTask.id===taskID)?'--active':''" @click="tasks.startTaskTimer(taskID)" :title="lang.ru.timer.start">
        <svg class="tasks__item-ico --start">
          <use :xlink:href="`#triangle`"></use>
        </svg>
      </button>



      <input v-model="tsk.name" @input="tasks.setTasksDataToLocalStorage" class="tasks__item-name" type="text" />



      <button
        class="tasks__item-btn tasks__item-stop"
        @click="tasks.stopTaskTimer()"
        :class="[(tasks.state.curTask.id === taskID) ? '--active' : '']"
        :title="lang.ru.timer.stop">

        <svg class="tasks__item-ico --stop">
          <use :xlink:href="`#square`"></use>
        </svg>

      </button>



      <time
        class="tasks__item-timer-today"
        v-if="tasks.state.data[taskID].durationToday.view">
        {{ tasks.state.data[taskID].durationToday.view }}
      </time>



      <button
        class="tasks__item-btn tasks__item-timerlist-open"
        @click="showTimerList(taskID)"
        :title="lang.ru.timer.list">
        <svg class="tasks__item-ico --timerlist">
          <use xlink:href="#clock"></use>
        </svg>
      </button>

      <div class="tasks__item-timerlist-wrapper" v-if="timerListID === taskID">

        <button
          class="tasks__item-btn tasks__item-timerlist-close"
          @click="hideTimerList(taskID)">

          <svg class="tasks__item-ico --close">
            <use :xlink:href="`#plus`"></use>
          </svg>

        </button>

        <ul class="tasks__item-timerlist">

          <li v-for="timerItem in timerList" :key="timerItem.start" class="tasks__item-timeritem" >
            <div class="tasks__item-timeritem-time">{{ `${timerItem.start} - ${timerItem.stop} (${timerItem.duration})` }}</div>
            
            <button
              class="tasks__item-btn tasks__item-timeritem-edit"
              :title="lang.ru.timer.editTimer">
              <svg class="tasks__item-ico --edit">
                <use xlink:href="#pen"></use>
              </svg>
            </button>
            
            <input type="text" class="tasks__item-timeritem-note">

            <button
              @click.self="addTaskTimerNote(taskID, timerItem.startID, $event);"
              class="tasks__item-btn tasks__item-timeritem-note-edit"
              :title="lang.ru.timer.addNote">
              <svg class="tasks__item-ico --note-edit">
                <use xlink:href="#note-edit"></use>
              </svg>
            </button>

            <button
              class="tasks__item-btn tasks__item-timeritem-remove"
              @click="deleteTaskTimerItem(taskID, timerItem.startID);"
              @mouseleave="protectionDeleteTaskTimerItem=-1"
              :title="lang.ru.timer.deleteTimer">

              <svg 
                class="tasks__item-ico --remove"
                :class="(timerItem.startID===protectionDeleteTaskTimerItem) ? '--red' : ''">
                <use :xlink:href="'#minus'"></use>
              </svg>

            </button>
          </li>

        </ul>

        <button class="tasks__item-btn tasks__item-timerlist-add" @click="isVisibleNewTimerInput=true" :title="lang.ru.timer.addTimer">
          <svg class="tasks__item-ico --add">
            <use :xlink:href="`#plus`"></use>
          </svg>
        </button>

        <div v-if="isVisibleNewTimerInput">
          <input type="text" v-model="newTimerInput">
         
          <button
            class="tasks__item-btn tasks__item-timerlist-confirm"
            @click="addTaskTimerItem(taskID); isVisibleNewTimerInput=false; showTimerList(taskID)"
            :title="lang.ru.timer.addTimerConfirm">

            <svg class="tasks__item-ico --confirm">
              <use :xlink:href="`#check`"></use>
            </svg>

          </button>
        </div>

      </div>



      <button 
        v-if="!viewTaskDeleteDialog" 
        class="tasks__item-btn tasks__item-remove" 
        @click="viewTaskDeleteDialog=true" 
        :title="lang.ru.tasks.delete">

        <svg class="tasks__item-ico --remove">
          <use :xlink:href="'#minus'"></use>
        </svg>

      </button>

      <button
        v-else
        class="tasks__item-btn tasks__item-remove-accept"
        @click="deleteTask(taskID); viewTaskDeleteDialog=false"
        @mouseleave="viewTaskDeleteDialog=false"
        :title="lang.ru.tasks.deleteExactly">

        <svg class="tasks__item-ico --remove --red">
          <use :xlink:href="'#minus'"></use>
        </svg>

      </button>

    </li>
  </ul>

  <AddTask :svgID="'plus'" :title="lang.ru.tasks.add" />
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasks } from '@/stores/tasks'
import AddTask from "@/components/AddTask.vue";
import lang from '@/lang'
let tasks = useTasks();



let viewTaskDeleteDialog = ref(false)

onMounted(() => {
  window.onbeforeunload = function (event) {
    tasks.stopTaskTimer(/* 'reload-page' */)
  }
})

let timerList = ref()
let timerListID = ref()

function showTimerList(ID: number) {
  timerListID.value = ID
  timerList.value = tasks.showTimerList(ID);
}

function hideTimerList(ID: number) {
  timerListID.value = null
}

let protectionDeleteTaskTimerItem = ref(-1) // -1 значит сброшен ID 
function deleteTaskTimerItem(taskID: number, taskStartID: number) {
  if (protectionDeleteTaskTimerItem.value===-1) {
    protectionDeleteTaskTimerItem.value = taskStartID
  } else {
    protectionDeleteTaskTimerItem.value = -1
    tasks.deleteTaskTimerItem(taskID, taskStartID)
    showTimerList(taskID)
  }
}

let isVisibleNewTimerInput = ref(false)
let newTimerInput = ref('0:00:00 - 0:00:00')
function addTaskTimerItem(taskID: number) {
  tasks.addTaskTimerItem(taskID, newTimerInput.value)
}

function deleteTask(taskID: number) {
  tasks.deleteTask(taskID)
}

function addTaskTimerNote(taskID: number, timerItemStartID: number, $event: any) {
  $event.target.previousElementSibling.classList.add('--active');
  // tasks.addTaskTimerNote(taskID, timerItemStartID)
}



// let tasksContextOpened = ref(false)
// function taskViewContextMenu(e) {
//   console.log(e)
//   tasksContextOpened.value = true
// }

// let durationTodayView = computed(()=>{
//   let id = tasks.state.curTask.id
//   if (id!==0) {
//     console.log('id')
//     console.log(id)
//     return tasks.state.data[id].durationToday.view
//   }
//   return ''
// })
</script>
