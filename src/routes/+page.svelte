<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<span> Home Page </span>

<form method="POST" action="?/signOut">
	<button>Signout</button>
</form>
