<script lang="ts">
  import Landing from '../../lib/components/Landing.svelte';
  let {data}: {data:{lang:'tr'|'de'|'en'}}=$props();
</script>
<Landing lang={data.lang}/>
