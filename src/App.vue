<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  min-height: 100%;
  background: #f5efe6;
  color: #1d1d1f;
  font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
}

view,
text,
button {
  box-sizing: border-box;
}
</style>
