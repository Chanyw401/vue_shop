<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/img/logo.png" alt="">
            </div>
            <!--登录表单区域-->
            <el-form ref="loginRef_1" :model="loginForm" :rules="loginRules" label-width="0px" class="login_form">
                <!--用户名-->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码-->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!--按钮-->
                <el-form-item class="btn_form">
                    <el-button type="primary" @click="loginConfirm">登录</el-button>
                    <el-button type="info" @click="btn_reset">重置</el-button>
                </el-form-item>

            </el-form>
        </div>
    </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        //这是登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        //这是表单的验证规则对象
        loginRules: {
          username: [
            {  //验证用户名
              required: true, message: '请输入登录名称', trigger: 'blur'
            },
            {
              min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur'
            }
          ],
          password: [
            {  //验证密码
              required: true, message: '请输入登陆密码', trigger: 'blur'
            },
            {
              min: 6, max: 15, message: '长度在6到15个字符', trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      //重置按钮
      btn_reset() {
        //resetFields:对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
        this.$refs.loginRef_1.resetFields()
        this.$data.loginForm.username = this.$data.loginForm.password = ''
      },
      //登录按钮
      loginConfirm() {
        //validate:对整个表单进行校验的方法，参数为一个回调函数
        this.$refs.loginRef_1.validate(async valid => {
          if (!valid) return;
          const {data: result} = await this.$http.post("login", this.loginForm)
          if (result.meta.status !== 200) return this.$messages.error("登录失败")
          // console.log('登陆成功')
          this.$messages.success("登陆成功")
          // console.log(result);
          //将登陆成功之后的token保存到客户端的sessionStorage中
          window.sessionStorage.setItem('token',result.data.token)
          //跳转到Home页面，利用编程式导航
          this.$router.push('/home')
        });
      }
    }
  }
</script>

<style scoped>
    .login_container {
        background-color: #2b4b6b;
        height: 100%;
    }

    .login_box {
        height: 300px;
        width: 450px;
        background-color: #fff;
        border-radius: 5px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        box-shadow: 0 0 10px #ffffff;
        padding: 10px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
    }

    .avatar_box img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }

    .login_form {
        position: absolute;
        bottom: 0;
        padding: 0 15px;
        box-sizing: border-box;
        width: 100%;
    }

    .btn_form {
        display: flex;
        justify-content: space-between;
    }
</style>