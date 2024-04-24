<template>
  <el-container>
    <!-- 用户头像与昵称区域 -->
    <el-header class="shadow flex items-center">
      <div class="flex items-center">
        <div class="flex flex-col items-center justify-center">
          <img
            ref="avatarImage"
            class="w-10 h-10 rounded-full mr-2 cursor-pointer"
            :src="user.avatar"
            alt="User Avatar"
          />
        </div>
        <div
          class="flex-1 flex items-baseline justify-center flex-col text-right"
        >
          <span class="mr-2">@name:{{ user.name }}</span>
          <span class="mr-2">@email:{{ user.email }}</span>
        </div>
      </div>
    </el-header>

    <el-main class="px-6 py-8">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card>
            <!-- 昵称、email、phone、location和role的展示 -->
            <el-form :model="user" label-position="left" label-width="auto">
              <el-form-item label="name">
                <el-input disabled v-model="user.name"></el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input disabled v-model="user.email"></el-input>
              </el-form-item>
              <el-form-item label="电话">
                <el-input disabled v-model="user.phone"></el-input>
              </el-form-item>
              <el-form-item label="地址">
                <el-input disabled v-model="user.location"></el-input>
              </el-form-item>
              <el-form-item label="职业">
                <el-input disabled v-model="user.role"></el-input>
              </el-form-item>
              <el-form-item label="介绍">
                <el-input disabled v-model="user.description"></el-input>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card>
            <div class="flex flex-col justify-center items-center">
              <el-form class="w-full">
                <el-form-item label="ID">
                  <el-input disabled v-model="user.id"></el-input>
                </el-form-item>
              </el-form>
              <div>
                <qrcode-component :value="user.id"></qrcode-component>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import useDexie from "@/hooks/useDexie";
const { activatedUserDb } = useDexie();
const user = ref((await activatedUserDb.info.limit(1).first())!);
</script>
