<template>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">
            <slot name="first"></slot>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
            <slot name="second"></slot>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
            <slot name="third"></slot>
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
  export default {
    name: "Crumb"
  }
</script>

<style scoped>

</style>