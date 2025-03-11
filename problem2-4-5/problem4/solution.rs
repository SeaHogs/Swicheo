fn main() {
    println!("{}", sum_to_n_a(5)); 
    println!("{}", sum_to_n_b(5)); 
    println!("{}", sum_to_n_c(5));
}

// Complexity: O(n) time, O(1) space.
fn sum_to_n_a(n: i32) -> i32 {
    let mut sum = 0;
    for i in 1..=n {
        sum += i;
    }
    sum
}

// Complexity: O(n) time, O(n) space (due to recursive calls).
fn sum_to_n_b(n: i32) -> i32 {
    if n <= 0 {
        return 0;
    }
    n + sum_to_n_b(n - 1)
}

// Complexity: O(1) time, O(1) space.
fn sum_to_n_c(n: i32) -> i32 {
    n * (n + 1) / 2
}
