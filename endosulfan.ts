
export let total_tests: number = 0;
export let failed_tests: number = 0;
export let passed_tests: number = 0;

export function test_assert(condition: boolean, test_name: string): boolean {
  total_tests++;
  if (condition) {
    passed_tests++;
    console.log(`\x1B[32mTEST PASS\x1B[m ${test_name}`);
    return true;
  } else {
    failed_tests++;
    console.log(`\x1B[31mTEST FAIL\x1B[m ${test_name}`);
    return false;
  }
}

//items will probably be strings or numbers,
//but any object that is comparable after a JSON.stringify() should be fine
export function test_assert_equal(first_item: any, second_item: any, test_name: string, silent: boolean=false) {
  if (typeof first_item !== typeof second_item) {
    throw Error("Cannot compare two items of different types!");
  }
  //if the items are objects (including arrays)
  if (typeof first_item === "object") {
    first_item = JSON.stringify(first_item);
    second_item = JSON.stringify(second_item);
  }
  let passed = test_assert(first_item === second_item, test_name);
  if (!silent && !passed) {
    //log info for debugging purposes
    //log both items
    console.log(`${test_name}:\n========\n${first_item}\n========\n${second_item}\n========`);
  }
}

export function log_test_results() {
  console.log(`Total Passed: \x1B[32m${passed_tests}/${total_tests}\x1B[m\nTotal Failed: \x1B[31m${failed_tests}/${total_tests}\x1B[m`);
}
